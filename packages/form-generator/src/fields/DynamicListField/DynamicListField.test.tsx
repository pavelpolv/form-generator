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

  it('1. renders with empty list — Add button visible, no items', () => {
    render(<TestWrapper config={baseConfig} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
    // No input placeholders rendered yet
    expect(screen.queryByPlaceholderText('Enter name')).toBeNull();
  });

  it('2. click Add appends an item with fields', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter age')).toBeInTheDocument();
  });

  it('3. click Remove deletes an item', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    // The remove button is first in DOM order (before the "Add item" button)
    const [removeButton] = screen.getAllByRole('button');
    await user.click(removeButton);
    expect(screen.queryByPlaceholderText('Enter name')).toBeNull();
  });

  it('4. defaultValue of item fields applied when Add clicked', async () => {
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

  it('5. visibleCondition false — list not rendered', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      visibleCondition: {
        comparisonType: 'and',
        children: [{ field: 'show', condition: '===', value: true }],
      },
    };
    const { container } = render(<TestWrapper config={config} formValues={{ show: false }} />);
    expect(container.innerHTML).toBe('');
  });

  it('6. visibleCondition true — list rendered', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      visibleCondition: {
        comparisonType: 'and',
        children: [{ field: 'show', condition: '===', value: true }],
      },
    };
    render(<TestWrapper config={config} formValues={{ show: true }} />);
    expect(screen.getByText('Add item')).toBeInTheDocument();
  });

  it('7. disabledCondition true — Add button disabled', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      disabledCondition: {
        comparisonType: 'and',
        children: [{ field: 'locked', condition: '===', value: true }],
      },
    };
    render(<TestWrapper config={config} formValues={{ locked: true }} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('8. validateCondition on item-field + forceShowErrors shows error', async () => {
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
    // Don't pass existing passengers — click Add to get one item with empty name
    render(<TestWrapper config={config} forceShowErrors={true} />);
    await user.click(screen.getByText('Add item'));
    // Item's name is empty in formValues scope → validateCondition fails → error shown
    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('9. visibleCondition on item-field hides the field inside item', async () => {
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
    // Add one item — formValues empty means itemValues.name=undefined=empty
    render(<TestWrapper config={config} />);
    await user.click(screen.getByText('Add item'));
    // name is visible (no visibleCondition), passport is hidden (name is empty in item scope)
    expect(screen.getByPlaceholderText('Enter name')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Enter passport')).toBeNull();
  });

  it('10. disabledCondition on item-field disables that field inside item', () => {
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
    // Item from defaultValues — no need to click "Add item"
    render(<TestWrapper config={config} formValues={{ passengers: [{ name: 'locked' }] }} />);
    // useFieldArray initializes from defaultValues — item is already rendered
    expect(screen.getByPlaceholderText('Enter name')).toBeDisabled();
  });

  it('11. field names registered as listName.0.fieldName', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    const nameInput = screen.getByPlaceholderText('Enter name');
    // react-hook-form registers the field with the nested path
    expect(nameInput).toHaveAttribute('name', 'passengers.0.name');
  });

  it('12. multiple items — each gets correct index in name', async () => {
    const user = userEvent.setup();
    render(<TestWrapper config={baseConfig} />);
    await user.click(screen.getByText('Add item'));
    await user.click(screen.getByText('Add item'));
    const inputs = screen.getAllByPlaceholderText('Enter name');
    expect(inputs[0]).toHaveAttribute('name', 'passengers.0.name');
    expect(inputs[1]).toHaveAttribute('name', 'passengers.1.name');
  });

  it('13. addButton.label customizes button text', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { label: 'Add passenger' },
    };
    render(<TestWrapper config={config} />);
    expect(screen.getByText('Add passenger')).toBeInTheDocument();
    expect(screen.queryByText('Add item')).toBeNull();
  });

  it('14. addButton.position=top renders button before items', async () => {
    const user = userEvent.setup();
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { position: 'top' },
    };
    render(<TestWrapper config={config} />);
    await user.click(screen.getByText('Add item'));
    const buttons = screen.getAllByRole('button');
    // Add button (top) should come before the remove button in DOM
    const addBtnIndex = buttons.findIndex(b => b.textContent?.includes('Add item'));
    const removeBtnIndex = buttons.findIndex(b => b.querySelector('[aria-label="minus-circle"]') || b.closest('[data-icon]'));
    expect(addBtnIndex).toBeLessThan(removeBtnIndex === -1 ? Infinity : removeBtnIndex);
  });

  it('15. addButton.block=false removes full-width styling', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { block: false },
    };
    render(<TestWrapper config={config} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).not.toHaveClass('ant-btn-block');
  });

  it('16. addButton.block=true (default) adds full-width styling', () => {
    render(<TestWrapper config={baseConfig} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toHaveClass('ant-btn-block');
  });

  it('17. addButton.size=small renders small button', () => {
    const config: DynamicListFieldConfig = {
      ...baseConfig,
      addButton: { size: 'small' },
    };
    render(<TestWrapper config={config} />);
    const addButton = screen.getByText('Add item').closest('button');
    expect(addButton).toHaveClass('ant-btn-sm');
  });
});
