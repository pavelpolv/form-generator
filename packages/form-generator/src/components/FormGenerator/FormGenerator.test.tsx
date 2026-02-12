import { createRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
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

  describe('default buttons (no config.buttons)', () => {
    it('should show default submit button when config.buttons is not set', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('should call onSubmit via default submit button', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(
        <FormGenerator
          config={simpleConfig}
          onSubmit={onSubmit}
        />,
      );

      const submitBtn = screen.getByText('Submit');
      await user.click(submitBtn);

      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('config.buttons', () => {
    it('should render buttons from config', () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: true,
            url: 'https://api.example.com/save',
          },
          {
            key: 'reset',
            label: 'Clear',
            action: 'reset',
          },
        ],
      };
      render(<FormGenerator config={config} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Clear')).toBeInTheDocument();
      expect(screen.queryByText('Submit')).toBeNull();
    });

    it('should render no buttons when config.buttons is empty array', () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [],
      };
      render(<FormGenerator config={config} />);
      expect(screen.queryByText('Submit')).toBeNull();
    });

    it('should reset form when reset button clicked', async () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          { key: 'reset', label: 'Clear', action: 'reset' },
        ],
      };
      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ firstName: 'Initial' }}
        />,
      );

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toHaveValue('Initial');

      await user.clear(input);
      await user.type(input, 'Changed');
      expect(input).toHaveValue('Changed');

      const clearBtn = screen.getByText('Clear');
      await user.click(clearBtn);

      expect(input).toHaveValue('Initial');
    });
  });

  describe('submit button with fetch', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('should call fetch on submit button click', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: false,
            url: 'https://api.example.com/save',
            method: 'PUT',
          },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ firstName: 'John' }}
        />,
      );

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/save', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        });
      });
    });

    it('should use POST as default method', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            action: 'submit',
            requiresValidation: false,
            url: 'https://api.example.com/save',
          },
        ],
      };

      const user = userEvent.setup();
      render(<FormGenerator config={config} />);

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/save', expect.objectContaining({
          method: 'POST',
        }));
      });
    });

    it('should call onSubmit callback after successful fetch', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);
      const onSubmit = vi.fn();

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            action: 'submit',
            requiresValidation: false,
            url: 'https://api.example.com/save',
          },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          onSubmit={onSubmit}
        />,
      );

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });
    });

    it('should not call onSubmit on fetch failure', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
      vi.stubGlobal('fetch', fetchMock);
      const onSubmit = vi.fn();

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            action: 'submit',
            requiresValidation: false,
            url: 'https://api.example.com/save',
          },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          onSubmit={onSubmit}
        />,
      );

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should reset form after submit when resetAfterSubmit is true', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            action: 'submit',
            requiresValidation: false,
            url: 'https://api.example.com/save',
            resetAfterSubmit: true,
          },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ firstName: 'Initial' }}
        />,
      );

      const input = screen.getByPlaceholderText('Enter first name');
      await user.clear(input);
      await user.type(input, 'Changed');

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(input).toHaveValue('Initial');
      });
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
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'https://api.example.com/save' },
          { key: 'reset', label: 'Reset', action: 'reset' },
        ],
      };
      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ firstName: 'Initial' }}
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
