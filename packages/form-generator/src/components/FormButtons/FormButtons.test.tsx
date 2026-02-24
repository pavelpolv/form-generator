import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormButtons } from './FormButtons';
import { ButtonConfig, SubmitButtonConfig } from '@/types';

const submitButton: SubmitButtonConfig = {
  key: 'save',
  label: 'Save',
  type: 'primary',
  action: 'submit',
  requiresValidation: true,
  url: 'https://api.example.com/save',
};

const resetButton: ButtonConfig = {
  key: 'reset',
  label: 'Reset',
  action: 'reset',
};

describe('FormButtons', () => {
  it('должен рендерить кнопки submit и reset', () => {
    render(
      <FormButtons
        buttons={[submitButton, resetButton]}
        loadingKey={null}
        onSubmitClick={vi.fn()}
        onResetClick={vi.fn()}
      />,
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('должен рендерить пустой контент при пустом массиве кнопок', () => {
    const { container } = render(
      <FormButtons
        buttons={[]}
        loadingKey={null}
        onSubmitClick={vi.fn()}
        onResetClick={vi.fn()}
      />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('должен вызывать onSubmitClick при нажатии кнопки submit', async () => {
    const onSubmitClick = vi.fn();
    const user = userEvent.setup();
    render(
      <FormButtons
        buttons={[submitButton]}
        loadingKey={null}
        onSubmitClick={onSubmitClick}
        onResetClick={vi.fn()}
      />,
    );

    await user.click(screen.getByText('Save'));
    expect(onSubmitClick).toHaveBeenCalledWith(submitButton);
  });

  it('должен вызывать onResetClick при нажатии кнопки reset', async () => {
    const onResetClick = vi.fn();
    const user = userEvent.setup();
    render(
      <FormButtons
        buttons={[resetButton]}
        loadingKey={null}
        onSubmitClick={vi.fn()}
        onResetClick={onResetClick}
      />,
    );

    await user.click(screen.getByText('Reset'));
    expect(onResetClick).toHaveBeenCalled();
  });

  it('должен отображать состояние загрузки на активной кнопке', () => {
    render(
      <FormButtons
        buttons={[submitButton, resetButton]}
        loadingKey="save"
        onSubmitClick={vi.fn()}
        onResetClick={vi.fn()}
      />,
    );

    const saveBtn = screen.getByText('Save').closest('button')!;
    expect(saveBtn.classList.toString()).toContain('loading');
  });

  it('должен блокировать остальные кнопки во время загрузки', () => {
    render(
      <FormButtons
        buttons={[submitButton, resetButton]}
        loadingKey="save"
        onSubmitClick={vi.fn()}
        onResetClick={vi.fn()}
      />,
    );

    const resetBtn = screen.getByText('Reset').closest('button')!;
    expect(resetBtn).toBeDisabled();
  });

  it('не должен блокировать кнопки когда загрузка не активна', () => {
    render(
      <FormButtons
        buttons={[submitButton, resetButton]}
        loadingKey={null}
        onSubmitClick={vi.fn()}
        onResetClick={vi.fn()}
      />,
    );

    const saveBtn = screen.getByText('Save').closest('button')!;
    const resetBtn = screen.getByText('Reset').closest('button')!;
    expect(saveBtn).not.toBeDisabled();
    expect(resetBtn).not.toBeDisabled();
  });
});
