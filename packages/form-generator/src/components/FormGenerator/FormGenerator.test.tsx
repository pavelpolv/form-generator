import { createRef } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormGenerator, FormGeneratorRef } from './FormGenerator';
import { FormConfig } from '@/types';

const simpleConfig: FormConfig = {
  groups: [
    {
      name: 'Personal Info',
      fields: [
        { type: 'input', name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
        { type: 'input', name: 'lastName', label: 'Last Name', placeholder: 'Enter last name' },
      ],
    },
  ],
};

const multiGroupConfig: FormConfig = {
  groups: [
    {
      name: 'Group 1',
      fields: [
        { type: 'input', name: 'field1', label: 'Field 1' },
      ],
    },
    {
      name: 'Group 2',
      fields: [
        { type: 'switch', name: 'toggle', label: 'Toggle' },
      ],
    },
  ],
};

describe('FormGenerator', () => {
  describe('rendering', () => {
    it('should render form with groups', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
    });

    it('should render multiple groups', () => {
      render(<FormGenerator config={multiGroupConfig} />);
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });
  });

  describe('submit button', () => {
    it('should show submit button by default', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should hide submit button when showSubmitButton=false', () => {
      render(<FormGenerator
        config={simpleConfig}
        showSubmitButton={false} />);
      expect(screen.queryByText('Submit')).toBeNull();
    });

    it('should show custom submit button text', () => {
      render(<FormGenerator
        config={simpleConfig}
        submitButtonText="Save" />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });

  describe('reset button', () => {
    it('should not show reset button by default', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.queryByText('Reset')).toBeNull();
    });

    it('should show reset button when showResetButton=true', () => {
      render(<FormGenerator
        config={simpleConfig}
        showResetButton={true} />);
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });

    it('should show custom reset button text', () => {
      render(<FormGenerator
        config={simpleConfig}
        showResetButton={true}
        resetButtonText="Clear" />);
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('button visibility', () => {
    it('should hide all buttons when both showSubmitButton=false and showResetButton=false', () => {
      render(<FormGenerator
        config={simpleConfig}
        showSubmitButton={false}
        showResetButton={false} />);
      expect(screen.queryByText('Submit')).toBeNull();
      expect(screen.queryByText('Reset')).toBeNull();
    });
  });

  describe('onChange', () => {
    it('should call onChange when values change', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<FormGenerator
        config={simpleConfig}
        onChange={onChange} />);

      const input = screen.getByPlaceholderText('Enter first name');
      await user.type(input, 'John');

      expect(onChange).toHaveBeenCalled();
    });

    it('should not crash without onChange', async () => {
      const user = userEvent.setup();
      render(<FormGenerator config={simpleConfig} />);

      const input = screen.getByPlaceholderText('Enter first name');
      await user.type(input, 'John');
      // No error should occur
      expect(input).toHaveValue('John');
    });
  });

  describe('onSubmit', () => {
    it('should call onSubmit when form is submitted', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<FormGenerator
        config={simpleConfig}
        onSubmit={onSubmit} />);

      const submitBtn = screen.getByText('Submit');
      await user.click(submitBtn);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should not crash without onSubmit', async () => {
      const user = userEvent.setup();
      render(<FormGenerator config={simpleConfig} />);

      const submitBtn = screen.getByText('Submit');
      await user.click(submitBtn);
      // No error should occur
    });
  });

  describe('reset', () => {
    it('should reset to initial values when reset button clicked', async () => {
      const user = userEvent.setup();
      render(
        <FormGenerator
          config={simpleConfig}
          initialValues={{ firstName: 'Initial' }}
          showResetButton={true}
        />,
      );

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toHaveValue('Initial');

      await user.clear(input);
      await user.type(input, 'Changed');
      expect(input).toHaveValue('Changed');

      const resetBtn = screen.getByText('Reset');
      await user.click(resetBtn);

      expect(input).toHaveValue('Initial');
    });
  });

  describe('imperative handle ref', () => {
    it('should expose getValues method', () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: 'John' }}
        />,
      );

      expect(ref.current).not.toBeNull();
      const values = ref.current!.getValues();
      expect(values.firstName).toBe('John');
    });

    it('should expose reset method', async () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: 'John' }}
        />,
      );

      await act(async () => {
        ref.current!.reset();
      });

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toHaveValue('John');
    });

    it('should expose submit method', async () => {
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          onSubmit={onSubmit}
        />,
      );

      await act(async () => {
        ref.current!.submit();
      });

      expect(onSubmit).toHaveBeenCalled();
    });

    it('should reset with custom values', async () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: 'John' }}
        />,
      );

      await act(async () => {
        ref.current!.reset({ firstName: 'Jane' });
      });

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toHaveValue('Jane');
    });
  });

  describe('order sorting', () => {
    it('should render groups sorted by order property', () => {
      const orderedConfig: FormConfig = {
        groups: [
          {
            name: 'Group C',
            order: 3,
            fields: [{ type: 'input', name: 'c', label: 'C' }],
          },
          {
            name: 'Group A',
            order: 1,
            fields: [{ type: 'input', name: 'a', label: 'A' }],
          },
          {
            name: 'Group B',
            order: 2,
            fields: [{ type: 'input', name: 'b', label: 'B' }],
          },
        ],
      };
      const { container } = render(<FormGenerator config={orderedConfig} />);
      const titles = container.querySelectorAll('.ant-card-head-title');
      expect(titles[0].textContent).toBe('Group A');
      expect(titles[1].textContent).toBe('Group B');
      expect(titles[2].textContent).toBe('Group C');
    });

    it('should default order to 0 when not specified', () => {
      const orderedConfig: FormConfig = {
        groups: [
          {
            name: 'Group B',
            order: 1,
            fields: [{ type: 'input', name: 'b', label: 'B' }],
          },
          {
            name: 'Group A',
            fields: [{ type: 'input', name: 'a', label: 'A' }],
          },
        ],
      };
      const { container } = render(<FormGenerator config={orderedConfig} />);
      const titles = container.querySelectorAll('.ant-card-head-title');
      expect(titles[0].textContent).toBe('Group A');
      expect(titles[1].textContent).toBe('Group B');
    });
  });

  describe('initialValues', () => {
    it('should default to empty object when no initialValues provided', () => {
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator
        ref={ref}
        config={simpleConfig} />);

      const values = ref.current!.getValues();
      expect(values).toBeDefined();
    });

    it('should use provided initialValues', () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: 'Test', lastName: 'User' }}
        />,
      );

      const values = ref.current!.getValues();
      expect(values.firstName).toBe('Test');
      expect(values.lastName).toBe('User');
    });
  });

});
