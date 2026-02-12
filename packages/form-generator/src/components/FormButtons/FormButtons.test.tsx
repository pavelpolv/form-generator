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
  it('should render submit and reset buttons', () => {
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

  it('should render nothing for empty buttons array', () => {
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

  it('should call onSubmitClick when submit button clicked', async () => {
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

  it('should call onResetClick when reset button clicked', async () => {
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

  it('should show loading state on the active button', () => {
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

  it('should disable other buttons during loading', () => {
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

  it('should not disable buttons when not loading', () => {
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
