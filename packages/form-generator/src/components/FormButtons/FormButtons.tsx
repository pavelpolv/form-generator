import { memo } from 'react';
import { Button, Space } from 'antd';
import { ButtonConfig, SubmitButtonConfig } from '@/types';

export interface FormButtonsProps {
  buttons: ButtonConfig[]
  loadingKey: string | null
  onSubmitClick: (button: SubmitButtonConfig) => void
  onResetClick: () => void
}

export const FormButtons = memo<FormButtonsProps>(
  ({ buttons, loadingKey, onSubmitClick, onResetClick }) => {
    if (buttons.length === 0) {
      return null;
    }

    return (
      <Space style={{ marginTop: 16 }}>
        {buttons.map((button) => {
          const isLoading = loadingKey === button.key;
          const isDisabled = loadingKey !== null && !isLoading;

          if (button.action === 'reset') {
            return (
              <Button
                key={button.key}
                type={button.type}
                disabled={isDisabled}
                onClick={onResetClick}
              >
                {button.label}
              </Button>
            );
          }

          return (
            <Button
              key={button.key}
              type={button.type ?? 'default'}
              loading={isLoading}
              disabled={isDisabled}
              onClick={() => onSubmitClick(button)}
            >
              {button.label}
            </Button>
          );
        })}
      </Space>
    );
  },
);

FormButtons.displayName = 'FormButtons';
