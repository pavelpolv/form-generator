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
  forceShowErrors = false,
}: {
  group: GroupField
  formValues?: FormValues
  touchedFields?: Record<string, boolean | undefined>
  forceShowErrors?: boolean
}) => {
  const { control } = useForm({ defaultValues: formValues });

  return (
    <FieldGroup
      group={group}
      control={control}
      formValues={formValues}
      touchedFields={touchedFields}
      forceShowErrors={forceShowErrors}
    />
  );
};

// Обёртка, позволяющая повторно рендерить с разными пропсами для тестирования React.memo
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
  const [forceShowErrors, setForceShowErrors] = useState(false);

  return (
    <div>
      <FieldGroup
        group={group}
        control={control}
        formValues={formValues}
        touchedFields={touchedFields}
        forceShowErrors={forceShowErrors}
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
      <button
        data-testid="toggle-force-errors"
        onClick={() => setForceShowErrors(prev => !prev)}>Toggle Force Errors</button>
    </div>
  );
};

// Обёртка, переключающая control для проверки сравнения в memo при смене control
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
        forceShowErrors={false}
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

  describe('видимость', () => {
    it('должен рендерить видимую группу', () => {
      render(<TestWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      expect(screen.getByText('Field 2')).toBeInTheDocument();
    });

    it('не должен рендерить невидимую группу', () => {
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

    it('должен рендерить группу когда visibleCondition выполнено', () => {
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
    it('должен рендерить Card когда showBorder=true (по умолчанию)', () => {
      render(<TestWrapper group={baseGroup} />);
      // Card рендерит заголовок иначе — через ant-card-head-title
      const card = document.querySelector('.ant-card');
      expect(card).not.toBeNull();
    });

    it('должен рендерить div когда showBorder=false', () => {
      const group: GroupField = { ...baseGroup, showBorder: false };
      render(<TestWrapper group={group} />);
      const card = document.querySelector('.ant-card');
      expect(card).toBeNull();
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('showTitle', () => {
    it('должен показывать заголовок когда showTitle=true (по умолчанию)', () => {
      render(<TestWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('не должен показывать заголовок когда showTitle=false с рамкой', () => {
      const group: GroupField = { ...baseGroup, showTitle: false };
      render(<TestWrapper group={group} />);
      // Card рендерится, но без заголовка
      const card = document.querySelector('.ant-card');
      expect(card).not.toBeNull();
      // Заголовок не должен рендериться как card head
      const cardHead = document.querySelector('.ant-card-head');
      expect(cardHead).toBeNull();
    });

    it('не должен показывать заголовок когда showTitle=false без рамки', () => {
      const group: GroupField = { ...baseGroup, showTitle: false, showBorder: false };
      const { container } = render(<TestWrapper group={group} />);
      expect(screen.getByText('Field 1')).toBeInTheDocument();
      // Название группы не должно присутствовать в документе как заголовок
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

    it('должен показывать ошибку валидации когда условие не выполнено и все поля тронуты', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{ field1: true }}
        />,
      );
      expect(screen.getByText('Field 1 is required')).toBeInTheDocument();
    });

    it('не должен показывать ошибку валидации когда условие не выполнено но поля не тронуты', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{}}
        />,
      );
      expect(screen.queryByText('Field 1 is required')).toBeNull();
    });

    it('не должен показывать ошибку валидации когда условие выполнено', () => {
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: 'value' }}
          touchedFields={{ field1: true }}
        />,
      );
      expect(screen.queryByText('Field 1 is required')).toBeNull();
    });

    it('должен корректно обрабатывать группу без validateCondition', () => {
      render(<TestWrapper
        group={baseGroup}
        formValues={{}}
        touchedFields={{}} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('стилизация showGroupError', () => {
    const groupWithValidation: GroupField = {
      ...baseGroup,
      validateCondition: {
        comparisonType: 'and',
        children: [
          { field: 'field1', condition: '!∅', message: 'Required' },
        ],
      },
    };

    it('должен добавлять стиль ошибки к Card при неудачной валидации', () => {
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

    it('должен применять цвет ошибки к заголовку div когда showBorder=false и валидация не прошла', () => {
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

  describe('пустые поля', () => {
    it('должен рендерить группу с пустым массивом fields', () => {
      const group: GroupField = { ...baseGroup, fields: [] };
      render(<TestWrapper group={group} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('сортировка по order', () => {
    it('должен рендерить поля отсортированные по свойству order', () => {
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

    it('должен использовать order=0 по умолчанию когда свойство не задано', () => {
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
    it('не должен рендерить поле когда visibleCondition ложно', () => {
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

    it('должен рендерить поле когда visibleCondition истинно', () => {
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

    it('должен показывать ошибку валидации поля когда validateCondition не выполнено и поле тронуто', () => {
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

    it('не должен показывать ошибку валидации поля когда поле не тронуто', () => {
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

    it('должен блокировать поле когда disabledCondition истинно', () => {
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

    it('не должен блокировать поле когда disabledCondition отсутствует', () => {
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

  describe('поведение React.memo при повторном рендере', () => {
    it('должен обрабатывать повторный рендер с изменёнными formValues', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Вызываем повторный рендер с новыми formValues
      await act(async () => {
        screen.getByTestId('update-values').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('должен обрабатывать повторный рендер с изменёнными touchedFields', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);

      // Вызываем повторный рендер с новыми touchedFields
      await act(async () => {
        screen.getByTestId('update-touched').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('должен обрабатывать повторный рендер с теми же значениями (оптимизация memo)', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);

      // Вызываем повторный рендер с теми же formValues (новая ссылка, но то же содержимое)
      await act(async () => {
        screen.getByTestId('same-rerender').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('должен перерендериваться когда ссылка на group меняется (запускает arePropsEqual)', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Меняем ссылку на group — запускает arePropsEqual возвращающий false
      await act(async () => {
        screen.getByTestId('change-group').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('должен перерендериваться когда ссылка на control меняется', async () => {
      render(<ControlChangeWrapper group={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      // Переключаемся на другой control — запускает проверку control !== nextProps.control
      await act(async () => {
        screen.getByTestId('switch-control').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });

    it('должен перерендериваться когда forceShowErrors меняется', async () => {
      render(<ReRenderWrapper initialGroup={baseGroup} />);
      expect(screen.getByText('Test Group')).toBeInTheDocument();

      await act(async () => {
        screen.getByTestId('toggle-force-errors').click();
      });
      expect(screen.getByText('Test Group')).toBeInTheDocument();
    });
  });

  describe('forceShowErrors', () => {
    it('должен показывать ошибки валидации когда forceShowErrors=true даже без тронутых полей', () => {
      const groupWithValidation: GroupField = {
        ...baseGroup,
        validateCondition: {
          comparisonType: 'and',
          children: [
            { field: 'field1', condition: '!∅', message: 'Field 1 is required' },
          ],
        },
      };
      render(
        <TestWrapper
          group={groupWithValidation}
          formValues={{ field1: '' }}
          touchedFields={{}}
          forceShowErrors={true}
        />,
      );
      expect(screen.getByText('Field 1 is required')).toBeInTheDocument();
    });

    it('должен показывать ошибки валидации полей когда forceShowErrors=true', () => {
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
          forceShowErrors={true}
        />,
      );
      expect(screen.getByText('Email required')).toBeInTheDocument();
    });
  });
});
