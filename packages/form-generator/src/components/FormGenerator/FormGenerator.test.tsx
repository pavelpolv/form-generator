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
  describe('рендеринг', () => {
    it('должен рендерить форму с группами', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
    });

    it('должен рендерить несколько групп', () => {
      render(<FormGenerator config={multiGroupConfig} />);
      expect(screen.getByText('Group 1')).toBeInTheDocument();
      expect(screen.getByText('Group 2')).toBeInTheDocument();
    });
  });

  describe('кнопки по умолчанию (config.buttons не задан)', () => {
    it('должен показывать кнопку submit по умолчанию когда config.buttons не задан', () => {
      render(<FormGenerator config={simpleConfig} />);
      expect(screen.getByText('Submit')).toBeInTheDocument();
    });

    it('должен вызывать onSubmit через кнопку submit по умолчанию', async () => {
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
    it('должен рендерить кнопки из конфига', () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: true,
            url: 'http://localhost:9999',
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

    it('должен не рендерить кнопки когда config.buttons является пустым массивом', () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [],
      };
      render(<FormGenerator config={config} />);
      expect(screen.queryByText('Submit')).toBeNull();
    });

    it('должен сбрасывать форму при нажатии кнопки reset', async () => {
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

  describe('кнопка submit с fetch', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('должен вызывать fetch при нажатии кнопки submit', async () => {
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
            url: 'http://localhost:9999',
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
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:9999', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String),
        });
      });
    });

    it('должен использовать POST как метод по умолчанию', async () => {
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
            url: 'http://localhost:9999',
          },
        ],
      };

      const user = userEvent.setup();
      render(<FormGenerator config={config} />);

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:9999', expect.objectContaining({
          method: 'POST',
        }));
      });
    });

    it('должен вызывать onSubmit после успешного fetch', async () => {
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
            url: 'http://localhost:9999',
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

    it('не должен вызывать onSubmit при ошибке fetch', async () => {
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
            url: 'http://localhost:9999',
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

    it('должен обрабатывать исключение не являющееся Error во время fetch', async () => {
      const fetchMock = vi.fn().mockRejectedValue('string error');
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          {
            key: 'save',
            label: 'Save',
            action: 'submit',
            requiresValidation: false,
            url: 'http://localhost:9999',
          },
        ],
      };

      const user = userEvent.setup();
      render(<FormGenerator config={config} />);

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
    });

    it('должен сбрасывать форму после отправки когда resetAfterSubmit=true', async () => {
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
            url: 'http://localhost:9999',
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
    it('должен вызывать onChange при изменении значений', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<FormGenerator
        config={simpleConfig}
        onChange={onChange} />);

      const input = screen.getByPlaceholderText('Enter first name');
      await user.type(input, 'John');

      expect(onChange).toHaveBeenCalled();
    });

    it('не должен падать без onChange', async () => {
      const user = userEvent.setup();
      render(<FormGenerator config={simpleConfig} />);

      const input = screen.getByPlaceholderText('Enter first name');
      await user.type(input, 'John');
      // Ошибок возникать не должно
      expect(input).toHaveValue('John');
    });
  });

  describe('onSubmit', () => {
    it('должен вызывать onSubmit при отправке формы', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<FormGenerator
        config={simpleConfig}
        onSubmit={onSubmit} />);

      const submitBtn = screen.getByText('Submit');
      await user.click(submitBtn);

      expect(onSubmit).toHaveBeenCalled();
    });

    it('не должен падать без onSubmit', async () => {
      const user = userEvent.setup();
      render(<FormGenerator config={simpleConfig} />);

      const submitBtn = screen.getByText('Submit');
      await user.click(submitBtn);
      // Ошибок возникать не должно
    });
  });

  describe('сброс', () => {
    it('должен сбрасывать к начальным значениям при нажатии кнопки reset', async () => {
      const config: FormConfig = {
        ...simpleConfig,
        buttons: [
          { key: 'submit', label: 'Submit', type: 'primary', action: 'submit', requiresValidation: true, url: 'http://localhost:9999' },
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

  describe('императивный ref', () => {
    it('должен предоставлять метод getValues', () => {
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

    it('должен предоставлять метод reset', async () => {
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

    it('должен предоставлять метод submit', async () => {
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

    it('должен предоставлять метод setValue для установки значения одного поля', async () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: '', lastName: '' }}
        />,
      );

      await act(async () => {
        ref.current!.setValue('firstName', 'Alice');
      });

      const input = screen.getByPlaceholderText('Enter first name');
      expect(input).toHaveValue('Alice');
    });

    it('должен возвращать обновлённое значение из getValues после setValue', async () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={simpleConfig}
          initialValues={{ firstName: '', lastName: '' }}
        />,
      );

      await act(async () => {
        ref.current!.setValue('lastName', 'Smith');
      });

      const values = ref.current!.getValues();
      expect(values.lastName).toBe('Smith');
    });

    it('должен сбрасывать к произвольным значениям', async () => {
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

  describe('сортировка по order', () => {
    it('должен рендерить группы отсортированные по свойству order', () => {
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

    it('должен использовать order=0 по умолчанию когда свойство не задано', () => {
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

  describe('submit с requiresValidation', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('должен показывать ошибки валидации и предотвращать отправку при неудачной валидации', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        groups: [
          {
            name: 'Group',
            fields: [
              {
                type: 'input',
                name: 'email',
                label: 'Email',
                placeholder: 'Enter email',
                validateCondition: {
                  comparisonType: 'and',
                  children: [{ field: 'email', condition: '!∅', message: 'Email required' }],
                },
              },
            ],
          },
        ],
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: true,
            url: 'http://localhost:9999',
          },
        ],
      };

      const user = userEvent.setup();
      render(<FormGenerator config={config} />);

      await user.click(screen.getByText('Save'));

      // Валидация не прошла, поэтому fetch НЕ должен быть вызван
      expect(fetchMock).not.toHaveBeenCalled();
      // Сообщение об ошибке должно быть показано (forceShowErrors=true)
      expect(screen.getByText('Email required')).toBeInTheDocument();
    });

    it('должен показывать ошибки валидации группы и предотвращать отправку', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        groups: [
          {
            name: 'Group',
            validateCondition: {
              comparisonType: 'and',
              children: [{ field: 'name', condition: '!∅', message: 'Name required' }],
            },
            fields: [
              { type: 'input', name: 'name', label: 'Name', placeholder: 'Enter name' },
            ],
          },
        ],
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: true,
            url: 'http://localhost:9999',
          },
        ],
      };

      const user = userEvent.setup();
      render(<FormGenerator config={config} />);

      await user.click(screen.getByText('Save'));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('должен отправлять форму когда валидация прошла успешно с requiresValidation', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      vi.stubGlobal('fetch', fetchMock);

      const config: FormConfig = {
        groups: [
          {
            name: 'Group',
            fields: [
              {
                type: 'input',
                name: 'email',
                label: 'Email',
                validateCondition: {
                  comparisonType: 'and',
                  children: [{ field: 'email', condition: '!∅' }],
                },
              },
            ],
          },
        ],
        buttons: [
          {
            key: 'save',
            label: 'Save',
            type: 'primary',
            action: 'submit',
            requiresValidation: true,
            url: 'http://localhost:9999',
          },
        ],
      };

      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ email: 'test@test.com' }}
        />,
      );

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalled();
      });
    });
  });

  describe('initialValues', () => {
    it('должен использовать пустой объект по умолчанию когда initialValues не задан', () => {
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator
        ref={ref}
        config={simpleConfig} />);

      const values = ref.current!.getValues();
      expect(values).toBeDefined();
    });

    it('должен использовать переданные initialValues', () => {
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

  describe('defaultValue из конфига полей', () => {
    const configWithDefaults: FormConfig = {
      groups: [
        {
          name: 'Group',
          fields: [
            { type: 'input', name: 'firstName', label: 'First Name', placeholder: 'Enter first name', defaultValue: 'Иван' },
            { type: 'input', name: 'lastName', label: 'Last Name', placeholder: 'Enter last name', defaultValue: 'Иванов' },
            { type: 'inputNumber', name: 'age', label: 'Age', placeholder: 'Enter age', defaultValue: 25 },
          ],
        },
      ],
    };

    it('должен применять defaultValue из конфига при инициализации формы', () => {
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator ref={ref} config={configWithDefaults} />);

      const values = ref.current!.getValues();
      expect(values.firstName).toBe('Иван');
      expect(values.lastName).toBe('Иванов');
      expect(values.age).toBe(25);
    });

    it('должен отображать defaultValue в инпутах', () => {
      render(<FormGenerator config={configWithDefaults} />);

      expect(screen.getByPlaceholderText('Enter first name')).toHaveValue('Иван');
      expect(screen.getByPlaceholderText('Enter last name')).toHaveValue('Иванов');
    });

    it('initialValues должен переопределять defaultValue для совпадающих полей', () => {
      const ref = createRef<FormGeneratorRef>();
      render(
        <FormGenerator
          ref={ref}
          config={configWithDefaults}
          initialValues={{ firstName: 'Пётр' }}
        />,
      );

      const values = ref.current!.getValues();
      // firstName переопределён initialValues
      expect(values.firstName).toBe('Пётр');
      // lastName берётся из defaultValue (нет в initialValues)
      expect(values.lastName).toBe('Иванов');
    });

    it('поле без defaultValue и без initialValues должно быть пустым', () => {
      const config: FormConfig = {
        groups: [
          {
            name: 'Group',
            fields: [
              { type: 'input', name: 'firstName', label: 'First Name', placeholder: 'Enter first name', defaultValue: 'Иван' },
              { type: 'input', name: 'comment', label: 'Comment', placeholder: 'Enter comment' },
            ],
          },
        ],
      };
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator ref={ref} config={config} />);

      const values = ref.current!.getValues();
      expect(values.firstName).toBe('Иван');
      expect(values.comment).toBeUndefined();
    });

    it('сброс формы должен возвращать к merged значениям (defaultValue + initialValues)', async () => {
      const config: FormConfig = {
        ...configWithDefaults,
        buttons: [{ key: 'reset', label: 'Reset', action: 'reset' }],
      };
      const user = userEvent.setup();
      render(
        <FormGenerator
          config={config}
          initialValues={{ firstName: 'Пётр' }}
        />,
      );

      const input = screen.getByPlaceholderText('Enter first name');
      await user.clear(input);
      await user.type(input, 'Изменено');
      expect(input).toHaveValue('Изменено');

      await user.click(screen.getByText('Reset'));

      // После сброса: firstName из initialValues, lastName из defaultValue
      expect(input).toHaveValue('Пётр');
      expect(screen.getByPlaceholderText('Enter last name')).toHaveValue('Иванов');
    });
  });

  describe('валидация dynamicList через ref.submit()', () => {
    const dynamicListConfig: FormConfig = {
      groups: [
        {
          name: 'Получатели',
          fields: [
            {
              type: 'dynamicList',
              name: 'recipients',
              label: 'Получатели',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'recipients', condition: '!∅', message: 'Добавьте хотя бы одного получателя' },
                ],
              },
              itemFields: [
                {
                  type: 'input',
                  name: 'name',
                  label: 'Имя',
                  placeholder: 'Полное имя',
                  validateCondition: {
                    comparisonType: 'and',
                    children: [
                      { field: 'name', condition: '!∅', message: 'Имя обязательно' },
                    ],
                  },
                },
                {
                  type: 'input',
                  name: 'email',
                  label: 'Email',
                  placeholder: 'email@example.com',
                  validateCondition: {
                    comparisonType: 'and',
                    children: [
                      { field: 'email', condition: '!∅', message: 'Email обязателен' },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    it('должен блокировать сабмит и показывать ошибку когда список пуст', async () => {
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator ref={ref} config={dynamicListConfig} onSubmit={onSubmit} />);

      await act(async () => { ref.current?.submit(); });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Добавьте хотя бы одного получателя')).toBeInTheDocument();
    });

    it('должен блокировать сабмит когда элементы есть но поля не заполнены', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator ref={ref} config={dynamicListConfig} onSubmit={onSubmit} />);

      // Добавляем элемент, не заполняем поля
      await user.click(screen.getByText('Add item'));
      await act(async () => { ref.current?.submit(); });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Имя обязательно')).toBeInTheDocument();
      expect(screen.getByText('Email обязателен')).toBeInTheDocument();
    });

    it('должен пропускать сабмит когда список заполнен и все поля валидны', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      render(<FormGenerator ref={ref} config={dynamicListConfig} onSubmit={onSubmit} />);

      await user.click(screen.getByText('Add item'));
      await user.type(screen.getByPlaceholderText('Полное имя'), 'Иван Петров');
      await user.type(screen.getByPlaceholderText('email@example.com'), 'ivan@example.com');

      await act(async () => { ref.current?.submit(); });

      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    });

    it('не должен показывать ошибки списка до попытки сабмита', async () => {
      render(<FormGenerator config={dynamicListConfig} />);
      expect(screen.queryByText('Добавьте хотя бы одного получателя')).not.toBeInTheDocument();
    });
  });

  describe('disabledCondition', () => {
    const disabledConfig: FormConfig = {
      groups: [{
        name: 'Test',
        fields: [
          {
            type: 'switch',
            name: 'lock',
            label: 'Lock',
            defaultValue: false,
          },
          {
            type: 'input',
            name: 'target',
            label: 'Target',
            placeholder: 'Target field',
            disabledCondition: {
              comparisonType: 'and',
              children: [{ field: 'lock', condition: '===', value: true }],
            },
          },
        ],
      }],
    };

    it('не должен блокировать поле при начальном состоянии disabledCondition=false', () => {
      render(<FormGenerator config={disabledConfig} />);
      expect(screen.getByPlaceholderText('Target field')).not.toBeDisabled();
    });

    it('должен немедленно блокировать поле когда disabledCondition становится истинным', async () => {
      const user = userEvent.setup();
      render(<FormGenerator config={disabledConfig} />);

      expect(screen.getByPlaceholderText('Target field')).not.toBeDisabled();

      // Переключаем свитч → lock = true → disabledCondition становится истинным
      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(screen.getByPlaceholderText('Target field')).toBeDisabled();
    });

    it('должен снимать блокировку поля когда disabledCondition становится ложным', async () => {
      const user = userEvent.setup();
      const config: FormConfig = {
        groups: [{
          name: 'Test',
          fields: [
            {
              type: 'switch',
              name: 'lock',
              label: 'Lock',
              defaultValue: true,
            },
            {
              type: 'input',
              name: 'target',
              label: 'Target',
              placeholder: 'Target field',
              disabledCondition: {
                comparisonType: 'and',
                children: [{ field: 'lock', condition: '===', value: true }],
              },
            },
          ],
        }],
      };

      render(<FormGenerator config={config} />);

      expect(screen.getByPlaceholderText('Target field')).toBeDisabled();

      const switchEl = screen.getByRole('switch');
      await user.click(switchEl);

      expect(screen.getByPlaceholderText('Target field')).not.toBeDisabled();
    });

    it('должен блокировать поле на основе значения текстового поля', async () => {
      const user = userEvent.setup();
      const config: FormConfig = {
        groups: [{
          name: 'Test',
          fields: [
            {
              type: 'input',
              name: 'source',
              label: 'Source',
              placeholder: 'Source field',
            },
            {
              type: 'input',
              name: 'target',
              label: 'Target',
              placeholder: 'Target field',
              disabledCondition: {
                comparisonType: 'and',
                children: [{ field: 'source', condition: '!∅' }],
              },
            },
          ],
        }],
      };

      render(<FormGenerator config={config} />);

      expect(screen.getByPlaceholderText('Target field')).not.toBeDisabled();

      await user.type(screen.getByPlaceholderText('Source field'), 'some value');

      expect(screen.getByPlaceholderText('Target field')).toBeDisabled();
    });
  });

  describe('validate() — условие без сообщений не должно блокировать сабмит', () => {
    it('не должен блокировать сабмит если validateCondition=false но сообщений нет', async () => {
      // Условие AND с guard-условием без message: когда guard ложен → AND ложен,
      // но сообщений нет → submit должен пройти
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      const config: FormConfig = {
        groups: [{
          name: 'Test',
          fields: [
            {
              type: 'switch',
              name: 'active',
              label: 'Active',
              defaultValue: false,
            },
            {
              type: 'input',
              name: 'target',
              label: 'Target',
              placeholder: 'Target',
              // AND: active===true (no message) AND target!∅ (has message)
              // Когда active=false → AND false, но message только у target!∅
              // → collectValidationMessages вернёт [] → не должно блокировать
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'active', condition: '===', value: true },
                  { field: 'target', condition: '!∅', message: 'Target обязателен' },
                ],
              },
            },
          ],
        }],
      };

      render(
        <FormGenerator
          ref={ref}
          config={config}
          onSubmit={onSubmit}
          initialValues={{ active: false, target: 'filled value' }}
        />,
      );

      await act(async () => { ref.current?.submit(); });

      // active=false → AND ложен, но target заполнен → collectValidationMessages=[] → submit проходит
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    });

    it('должен блокировать сабмит и показывать ошибку когда validateCondition=false с сообщением', async () => {
      const onSubmit = vi.fn();
      const ref = createRef<FormGeneratorRef>();
      const config: FormConfig = {
        groups: [{
          name: 'Test',
          fields: [
            {
              type: 'input',
              name: 'target',
              label: 'Target',
              placeholder: 'Target',
              validateCondition: {
                comparisonType: 'and',
                children: [
                  { field: 'target', condition: '!∅', message: 'Target обязателен' },
                ],
              },
            },
          ],
        }],
      };

      render(<FormGenerator ref={ref} config={config} onSubmit={onSubmit} />);

      await act(async () => { ref.current?.submit(); });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Target обязателен')).toBeInTheDocument();
    });
  });

});
