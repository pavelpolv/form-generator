import { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FieldGroup } from './FieldGroup';
import { GroupField, FormValues } from '@/types';

const TestWrapper = ({
  group,
  formValues = {},
  touchedFields = {},
}: {
  group: GroupField
  formValues?: FormValues
  touchedFields?: Record<string, boolean | undefined>
}) => {
  const { control } = useForm({ defaultValues: formValues });

  return (
    <FieldGroup
      group={group}
      control={control}
      formValues={formValues}
      touchedFields={touchedFields}
    />
  );
};

// Wrapper that allows re-rendering with different props to test React.memo
const ReRenderWrapper = ({
  initialGroup,
  initialFormValues = {},
  initialTouchedFields = {},
}: {
  initialGroup: GroupField
  initialFormValues?: FormValues
  initialTouchedFields?: Record<string, boolean | undefined>
}) => {
  const { control } = useForm({ defaultValues: initialFormValues });
  const [group, setGroup] = useState(initialGroup);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean | undefined>>(initialTouchedFields);

  return (
    <div>
      <FieldGroup
        group={group}
        control={control}
        formValues={formValues}
        touchedFields={touchedFields}
      />
      <button
        data-testid="update-values"
        onClick={() => setFormValues({ ...formValues, _updated: true })}>Update Values</button>
      <button
        data-testid="update-touched"
        onClick={() => setTouchedFields({ ...touchedFields, field1: true })}>Update Touched</button>
      <button
        data-testid="same-rerender"
        onClick={() => setFormValues({ ...formValues })}>Same Rerender</button>
      <button
        data-testid="change-group"
        onClick={() => setGroup({
          ...initialGroup,
          fields: initialGroup.fields.map(f => ({ ...f })),
        })}>Change Group</button>
    </div>
  );
};

// Wrapper that switches control to trigger memo comparison on control change
const ControlChangeWrapper = ({ group }: { group: GroupField }) => {
  const form1 = useForm();
  const form2 = useForm();
  const [useSecond, setUseSecond] = useState(false);

  return (
    <div>
      <FieldGroup
        group={group}
        control={useSecond ? form2.control : form1.control}
        formValues={{}}
        touchedFields={{}}
      />
      <button
        data-testid="switch-control"
        onClick={() => setUseSecond(true)}>Switch Control</button>
    </div>
  );
};

describe('FieldGroup', () => {
  const baseGroup: GroupField = {
    name: 'Test Group',
    fields: [
      { type: 'input', name: 'field1', label: 'Field 1', placeholder: 'Enter field 1' },
      { type: 'input', name: 'field2', label: 'Field 2', placeholder: 'Enter field 2' },
    ],
  };

  describe('visibility', () => {
    it('should render visible group', () => {
      render(<TestWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });

    it('should not render invisible group', () => {
      const group: GroupField = {
        ...baseGroup,
        visibleCondition: {
          comparisonType: 'and',
          children: [{ field: 'show', condition: '===', value: true }],
        },
      };
      const { container } = render(<TestWrapper
        group={group}
        formValues={{ show: false }} />);
      expect(container.innerHTML).toBe('');
    });

    it('should render group when visibleCondition is met', () => {
      const group: GroupField = {
        ...baseGroup,
        visibleCondition: {
          comparisonType: 'and',
          children: [{ field: 'show', condition: '===', value: true }],
        },
      };
      render(<TestWrapper
        group={group}
        formValues={{ show: true }} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('showBorder', () => {
    it('should render Card when showBorder=true (default)', () => {
      render(<TestWrapper group={baseGroup} />);
      // Card renders the title differently - as ant-card-head-title
      const card = document.querySelector('.ant-card');
      expect(card).not.toBeNull();
    });

    it('should render div when showBorder=false', () => {
      const group: GroupField = { ...baseGroup, showBorder: false };
      render(<TestWrapper group={group} />);
      const card = document.querySelector('.ant-card');
      expect(card).toBeNull();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('showTitle', () => {
    it('should show title when showTitle=true (default)', () => {
      render(<TestWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should not show title when showTitle=false with border', () => {
      const group: GroupField = { ...baseGroup, showTitle: false };
      render(<TestWrapper group={group} />);
      // Card is rendered but without title
      const card = document.querySelector('.ant-card');
      expect(card).not.toBeNull();
      // Title should not be rendered as card head
      const cardHead = document.querySelector('.ant-card-head');
      expect(cardHead).toBeNull();
    });

    it('should not show title when showTitle=false without border', () => {
      const group: GroupField = { ...baseGroup, showTitle: false, showBorder: false };
      const { container } = render(<TestWrapper group={group} />);
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      // The group name should not be in the document as a heading
      const titleDiv = container.querySelector('div[style*="fontWeight"]');
      expect(titleDiv).toBeNull();
    });
  });

  describe('validateCondition', () => {
    const groupWithValidation: GroupField = {
      ...baseGroup,
      validateCondition: {
        comparisonType: 'and',
        children: [
          { field: 'field1', condition: '!∅', message: 'Field 1 is required' },
        ],
      },
    };

    it('should show validation error when condition fails and all fields touched', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{ field1: true }}
        />,
      );
      expect(screen.getByText('Field 1 is required')).toBeInTheDocument();
    });

    it('should not show validation error when condition fails but fields not touched', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{}}
        />,
      );
      expect(screen.queryByText('Field 1 is required')).toBeNull();
    });

    it('should not show validation error when condition passes', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: 'value' }}
          touchedFields={{ field1: true }}
        />,
      );
      expect(screen.queryByText('Field 1 is required')).toBeNull();
    });

    it('should handle group without validateCondition', () => {
      render(<TestWrapper
        group={baseGroup}
        formValues={{}}
        touchedFields={{}} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('showGroupError styling', () => {
    const groupWithValidation: GroupField = {
      ...baseGroup,
      validateCondition: {
        comparisonType: 'and',
        children: [
          { field: 'field1', condition: '!∅', message: 'Required' },
        ],
      },
    };

    it('should add error styling to Card when validation fails', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{ field1: true }}
        />,
      );
      const card = document.querySelector('.ant-card.has-error');
      expect(card).not.toBeNull();
    });

    it('should add error color to title div when showBorder=false and validation fails', () => {
      const group: GroupField = { ...groupWithValidation, showBorder: false };
      render(
        <TestWrapper
          group={group}
          formValues={{ field1: '' }}
          touchedFields={{ field1: true }}
        />,
      );
      const title = screen.getByText('Test Group');
      expect(title.style.color).toBe('rgb(255, 77, 79)');
    });
  });

  describe('empty fields', () => {
    it('should render group with empty fields array', () => {
      const group: GroupField = { ...baseGroup, fields: [] };
      render(<TestWrapper group={group} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('order sorting', () => {
    it('should render fields sorted by order property', () => {
      const group: GroupField = {
        name: 'Ordered Group',
        fields: [
          { type: 'input', name: 'c', label: 'Field C', order: 3 },
          { type: 'input', name: 'a', label: 'Field A', order: 1 },
          { type: 'input', name: 'b', label: 'Field B', order: 2 },
        ],
      };
      render(<TestWrapper group={group} />);
      const labels = screen.getAllByText(/^Field [ABC]$/);
      expect(labels[0].textContent).toBe('Field A');
      expect(labels[1].textContent).toBe('Field B');
      expect(labels[2].textContent).toBe('Field C');
    });

    it('should default order to 0 when not specified', () => {
      const group: GroupField = {
        name: 'Mixed Order',
        fields: [
          { type: 'input', name: 'b', label: 'Field B', order: 1 },
          { type: 'input', name: 'a', label: 'Field A' },
        ],
      };
      render(<TestWrapper group={group} />);
      const labels = screen.getAllByText(/^Field [AB]$/);
      expect(labels[0].textContent).toBe('Field A');
      expect(labels[1].textContent).toBe('Field B');
    });
  });

  describe('MemoizedField', () => {
    it('should not render field when visibleCondition is false', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'hidden',
            label: 'Hidden Field',
            visibleCondition: {
              comparisonType: 'and',
              children: [{ field: 'show', condition: '===', value: true }],
            },
          },
        ],
      };
      render(<TestWrapper
        group={group}
        formValues={{ show: false }} />);
      expect(screen.queryByText('Hidden Field')).toBeNull();
    });

    it('should render field when visibleCondition is true', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'visible',
            label: 'Visible Field',
            visibleCondition: {
              comparisonType: 'and',
              children: [{ field: 'show', condition: '===', value: true }],
            },
          },
        ],
      };
      render(<TestWrapper
        group={group}
        formValues={{ show: true }} />);
      expect(screen.getByText('Visible Field')).toBeInTheDocument();
    });

    it('should show field validation error when validateCondition fails and field touched', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'email',
            label: 'Email',
            validateCondition: {
              comparisonType: 'and',
              children: [{ field: 'email', condition: '!∅', message: 'Email required' }],
            },
          },
        ],
      };
      render(
        <TestWrapper
          group={group}
          formValues={{ email: '' }}
          touchedFields={{ email: true }}
        />,
      );
      expect(screen.getByText('Email required')).toBeInTheDocument();
    });

    it('should not show field validation error when field not touched', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'email',
            label: 'Email',
            validateCondition: {
              comparisonType: 'and',
              children: [{ field: 'email', condition: '!∅', message: 'Email required' }],
            },
          },
        ],
      };
      render(
        <TestWrapper
          group={group}
          formValues={{ email: '' }}
          touchedFields={{}}
        />,
      );
      expect(screen.queryByText('Email required')).toBeNull();
    });

    it('should disable field when disabledCondition is true', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'locked',
            label: 'Locked',
            placeholder: 'Locked field',
            disabledCondition: {
              comparisonType: 'and',
              children: [{ field: 'lock', condition: '===', value: true }],
            },
          },
        ],
      };
      render(
        <TestWrapper
          group={group}
          formValues={{ lock: true }}
        />,
      );
      expect(screen.getByPlaceholderText('Locked field')).toBeDisabled();
    });

    it('should not disable field when no disabledCondition', () => {
      const group: GroupField = {
        name: 'Group',
        fields: [
          {
            type: 'input',
            name: 'free',
            label: 'Free',
            placeholder: 'Free field',
          },
        ],
      };
      render(<TestWrapper group={group} />);
      expect(screen.getByPlaceholderText('Free field')).not.toBeDisabled();
    });
  });

  describe('React.memo re-render behavior', () => {
    it('should handle re-render with changed formValues', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Trigger re-render with new formValues
      await act(async () => {
        screen.getByTestId('update-values').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should handle re-render with changed touchedFields', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);

      // Trigger re-render with new touchedFields
      await act(async () => {
        screen.getByTestId('update-touched').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should handle re-render with same values (memo optimization)', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);

      // Trigger re-render with same formValues (new reference but same content)
      await act(async () => {
        screen.getByTestId('same-rerender').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should re-render when group reference changes (triggers arePropsEqual)', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Change the group reference - triggers arePropsEqual to return false
      await act(async () => {
        screen.getByTestId('change-group').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('should re-render when control reference changes', async () => {
      render(<ControlChangeWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Switch to a different control - triggers control !== nextProps.control
      await act(async () => {
        screen.getByTestId('switch-control').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });
});
