import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { DynamicListField } from './DynamicListField';
import { DynamicListField as DynamicListFieldConfig, FormValues } from '@/types';

const TestWrapper = ({
  config,
  formValues = {},
  forceShowErrors = false,
}: {
  config: DynamicListFieldConfig
  formValues?: FormValues
  forceShowErrors?: boolean
}) => {
  const { control } = useForm({ defaultValues: formValues });

  return (
    <DynamicListField
      config={config}
      control={control}
      formValues={formValues}
      forceShowErrors={forceShowErrors}
    />
  );
};

describe('DynamicListField', () => {
  const baseConfig: DynamicListFieldConfig = {
    type: 'dynamicList',
    name: 'passengers',
    label: 'Passengers',
    itemFields: [
      { type: 'input', name: 'name', label: 'Name', placeholder: 'Enter name' },
      { type: 'inputNumber', name: 'age', label: 'Age', placeholder: 'Enter age' },
    ],
  };

  it('1. рендерит пустой список — кнопка добавления видна, элементов нет', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
    // Плейсхолдеры инпутов ещё не отрендерены
    expect(screen.queryByPlaceholderText('Enter name')).toBeNull();
  });

  it('2. клик по «Добавить» добавляет элемент с полями', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter age')).toBeInTheDocument();
  });

  it('3. клик по «Удалить» удаляет элемент', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    // Кнопка удаления первая в DOM (перед кнопкой «Add item»)
    const [removeButton] = screen.getAllByRole('button');
    await user.click(removeButton);
    expect(screen.queryByPlaceholderText('Enter name')).toBeNull();
  });

  it('4. defaultValue полей элемента применяется при клике «Добавить»', async () => {
    const user = userEvent.setup();
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      itemFields: [
        { type: 'input', name: 'name', label: 'Name', placeholder: 'Enter name', defaultValue: 'John' },
      ],
    };
    render(<TestWrapper config={config} />);
    await user.click(screen.getByText('Add item'));
    expect(screen.getByPlaceholderText('Enter name')).toHaveValue('John');
  });

  it('5. visibleCondition=false — список не рендерится', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      visibleCondition: {
        comparisonType: 'and',
        children: [{ field: 'show', condition: '===', value: true }],
      },
    };
    const { container } = render(<TestWrapper
      config={config}
      formValues={{ show: false }} />);
    expect(container.innerHTML).toBe('');
  });

  it('6. visibleCondition=true — список рендерится', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      visibleCondition: {
        comparisonType: 'and',
        children: [{ field: 'show', condition: '===', value: true }],
      },
    };
    render(<TestWrapper
      config={config}
      formValues={{ show: true }} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('7. disabledCondition=true — кнопка добавления заблокирована', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      disabledCondition: {
        comparisonType: 'and',
        children: [{ field: 'locked', condition: '===', value: true }],
      },
    };
    render(<TestWrapper
      config={config}
      formValues={{ locked: true }} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('8. validateCondition на поле элемента + forceShowErrors показывает ошибку', async () => {
    const user = userEvent.setup();
    const config: DynamicListFieldConfig = {
      type: 'dynamicList',
      name: 'passengers',
      label: 'Passengers',
      itemFields: [
        {
          type: 'input',
          name: 'name',
          label: 'Name',
          placeholder: 'Enter name',
          validateCondition: {
            comparisonType: 'and',
            children: [{ field: 'name', condition: '!∅', message: 'Name is required' }],
          },
        },
      ],
    };
    // Не передаём существующих пассажиров — кликаем «Добавить», получаем элемент с пустым именем
    render(<TestWrapper
      config={config}
      forceShowErrors={true} />);
    await user.click(screen.getByText('Add item'));
    // Имя элемента пустое в области видимости formValues → validateCondition не проходит → ошибка отображается
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('9. visibleCondition на поле элемента скрывает его внутри элемента', async () => {
    const user = userEvent.setup();
    const config: DynamicListFieldConfig = {
      type: 'dynamicList',
      name: 'passengers',
      label: 'Passengers',
      itemFields: [
        { type: 'input', name: 'name', label: 'Name', placeholder: 'Enter name' },
        {
          type: 'input',
          name: 'passport',
          label: 'Passport',
          placeholder: 'Enter passport',
          visibleCondition: {
            comparisonType: 'and',
            children: [{ field: 'name', condition: '!∅' }],
          },
        },
      ],
    };
    // Добавляем один элемент — formValues пустые, значит itemValues.name=undefined=пусто
    render(<TestWrapper config={config} />);
    await user.click(screen.getByText('Add item'));
    // name видно (нет visibleCondition), passport скрыт (name пустое в области элемента)
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter passport')).toBeNull();
  });

  it('10. disabledCondition на поле элемента блокирует это поле внутри элемента', () => {
    const config: DynamicListFieldConfig = {
      type: 'dynamicList',
      name: 'passengers',
      label: 'Passengers',
      itemFields: [
        {
          type: 'input',
          name: 'name',
          label: 'Name',
          placeholder: 'Enter name',
          disabledCondition: {
            comparisonType: 'and',
            children: [{ field: 'name', condition: '===', value: 'locked' }],
          },
        },
      ],
    };
    // Элемент из defaultValues — кликать «Add item» не нужно
    render(<TestWrapper
      config={config}
      formValues={{ passengers: [{ name: 'locked' }] }} />);
    // useFieldArray инициализируется из defaultValues — элемент уже отрендерен
    expect(screen.getByPlaceholderText('Enter name')).toBeDisabled();
  });

  it('11. имена полей регистрируются как listName.0.fieldName', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    const nameInput = screen.getByPlaceholderText('Enter name');
    // react-hook-form регистрирует поле с вложенным путём
    expect(nameInput).toHaveAttribute('name', 'passengers.0.name');
  });

  it('12. несколько элементов — каждый получает правильный индекс в имени', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    await user.click(screen.getByText('Add item'));
    const inputs = screen.getAllByPlaceholderText('Enter name');
    expect(inputs[0]).toHaveAttribute('name', 'passengers.0.name');
    expect(inputs[1]).toHaveAttribute('name', 'passengers.1.name');
  });

  it('13. addButton.label изменяет текст кнопки', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { label: 'Add passenger' },
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('Add passenger')).toBeInTheDocument();
    expect(screen.queryByText('Add item')).toBeNull();
  });

  it('14. addButton.position=top рендерит кнопку перед элементами', async () => {
    const user = userEvent.setup();
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { position: 'top' },
    };
    render(<TestWrapper config={config} />);
    await user.click(screen.getByText('Add item'));
    const buttons = screen.getAllByRole('button');
    // Кнопка добавления (top) должна идти перед кнопкой удаления в DOM
    const addBtnIndex = buttons.findIndex(b => b.textContent?.includes('Add item'));
    const removeBtnIndex = buttons.findIndex(b => b.querySelector('[aria-label="minus-circle"]') || b.closest('[data-icon]'));
    expect(addBtnIndex).toBeLessThan(removeBtnIndex === -1 ? Infinity : removeBtnIndex);
  });

  it('15. addButton.block=false убирает стиль на всю ширину', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { block: false },
    };
    render(<TestWrapper config={config} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).not.toHaveClass('ant-btn-block');
  });

  it('16. addButton.block=true (по умолчанию) добавляет стиль на всю ширину', () => {
    render(<TestWrapper config={baseConfig} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toHaveClass('ant-btn-block');
  });

  it('17. addButton.size=small рендерит маленькую кнопку', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { size: 'small' },
    };
    render(<TestWrapper config={config} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toHaveClass('ant-btn-sm');
  });
});
