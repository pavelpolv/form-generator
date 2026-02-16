import { useRef, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button, Space, Card, Typography, Divider } from 'antd'
import { FormGenerator } from '@/components/FormGenerator'
import { FormGeneratorRef } from '@/components/FormGenerator/FormGenerator'
import { FormConfig, FormValues } from '@/types'

const { Text, Title } = Typography

const meta: Meta = {
  title: 'Examples/External Control (ref)',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- Story 1: External Buttons ---

const formConfig: FormConfig = {
  groups: [
    {
      name: 'Profile',
      fields: [
        {
          type: 'input',
          name: 'name',
          label: 'Name',
          placeholder: 'Enter your name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter your email',
          inputType: 'email',
        },
        {
          type: 'textarea',
          name: 'bio',
          label: 'Bio',
          placeholder: 'Tell us about yourself...',
          rows: 3,
        },
      ],
    },
  ],
}

const ExternalButtonsExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)

  return (
    <div>
      <Title level={4}>External Buttons</Title>
      <Text type="secondary">
        Form buttons are outside the FormGenerator component.
        The ref provides getValues(), reset(), and submit() methods.
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: '', email: '', bio: '' }}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          onClick={() => formRef.current?.submit()}
        >
          Submit (external)
        </Button>
        <Button
          onClick={() => formRef.current?.reset()}
        >
          Reset (external)
        </Button>
        <Button
          onClick={() => formRef.current?.reset({
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'Software Engineer',
          })}
        >
          Fill with sample data
        </Button>
      </Space>
    </div>
  )
}

export const ExternalButtons: StoryObj = {
  render: () => <ExternalButtonsExample />,
}

// --- Story 2: Read Form Values ---

const ReadValuesExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [snapshot, setSnapshot] = useState<FormValues | null>(null)

  return (
    <div>
      <Title level={4}>Read Form Values</Title>
      <Text type="secondary">
        Use getValues() to read current form state at any time without submitting.
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: 'Alice', email: 'alice@example.com', bio: '' }}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          onClick={() => setSnapshot(formRef.current?.getValues() ?? null)}
        >
          Read current values
        </Button>
        <Button onClick={() => setSnapshot(null)}>
          Clear snapshot
        </Button>
      </Space>

      {snapshot && (
        <Card style={{ marginTop: 16, background: '#f6f6f6' }}>
          <Text strong>Snapshot:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export const ReadValues: StoryObj = {
  render: () => <ReadValuesExample />,
}

// --- Story 3: Wizard / Multi-step ---

const step1Config: FormConfig = {
  groups: [
    {
      name: 'Step 1: Personal Info',
      fields: [
        {
          type: 'input',
          name: 'firstName',
          label: 'First Name',
          placeholder: 'Enter first name',
          inputType: 'text',
        },
        {
          type: 'input',
          name: 'lastName',
          label: 'Last Name',
          placeholder: 'Enter last name',
          inputType: 'text',
        },
      ],
    },
  ],
}

const step2Config: FormConfig = {
  groups: [
    {
      name: 'Step 2: Contact',
      fields: [
        {
          type: 'input',
          name: 'email',
          label: 'Email',
          placeholder: 'Enter email',
          inputType: 'email',
        },
        {
          type: 'input',
          name: 'phone',
          label: 'Phone',
          placeholder: 'Enter phone number',
          inputType: 'tel',
        },
      ],
    },
  ],
}

const step3Config: FormConfig = {
  groups: [
    {
      name: 'Step 3: Additional Info',
      fields: [
        {
          type: 'textarea',
          name: 'notes',
          label: 'Notes',
          placeholder: 'Any additional notes...',
          rows: 4,
        },
        {
          type: 'switch',
          name: 'subscribe',
          label: 'Subscribe to newsletter',
          checkedText: 'Yes',
          uncheckedText: 'No',
        },
      ],
    },
  ],
}

const steps = [step1Config, step2Config, step3Config]

const WizardExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [collectedData, setCollectedData] = useState<FormValues>({})
  const [submitted, setSubmitted] = useState(false)

  const handleNext = () => {
    const values = formRef.current?.getValues() ?? {}
    const merged = { ...collectedData, ...values }
    setCollectedData(merged)

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setSubmitted(true)
    }
  }

  const handleBack = () => {
    const values = formRef.current?.getValues() ?? {}
    setCollectedData({ ...collectedData, ...values })
    setCurrentStep(currentStep - 1)
  }

  if (submitted) {
    return (
      <div>
        <Title level={4}>Wizard Complete</Title>
        <Card style={{ background: '#f6ffed' }}>
          <Text strong>Collected data from all steps:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(collectedData, null, 2)}
          </pre>
        </Card>
        <Button
          style={{ marginTop: 16 }}
          onClick={() => { setSubmitted(false); setCurrentStep(0); setCollectedData({}) }}
        >
          Start over
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Title level={4}>Multi-step Wizard</Title>
      <Text type="secondary">
        Each step is a separate FormGenerator. The ref is used to collect values
        before moving to the next step.
      </Text>

      <div style={{ margin: '16px 0' }}>
        <Space>
          {steps.map((_, i) => (
            <Text
              key={i}
              strong={i === currentStep}
              type={i === currentStep ? undefined : 'secondary'}
            >
              Step {i + 1}{i < steps.length - 1 ? ' →' : ''}
            </Text>
          ))}
        </Space>
      </div>

      <Card>
        <FormGenerator
          key={currentStep}
          ref={formRef}
          config={{ ...steps[currentStep], buttons: [] }}
          initialValues={collectedData}
        />
      </Card>

      <Divider />

      <Space>
        <Button
          disabled={currentStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        <Button type="primary" onClick={handleNext}>
          {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Space>
    </div>
  )
}

export const Wizard: StoryObj = {
  render: () => <WizardExample />,
}

// --- Story 4: SetValue ---

const SetValueExample = () => {
  const formRef = useRef<FormGeneratorRef>(null)
  const [snapshot, setSnapshot] = useState<FormValues | null>(null)

  const refreshSnapshot = () => {
    setSnapshot(formRef.current?.getValues() ?? null)
  }

  return (
    <div>
      <Title level={4}>Set Individual Field Values</Title>
      <Text type="secondary">
        Use setValue() to programmatically set values for individual fields without resetting the entire form.
      </Text>

      <Card style={{ marginTop: 16 }}>
        <FormGenerator
          ref={formRef}
          config={{ ...formConfig, buttons: [] }}
          initialValues={{ name: '', email: '', bio: '' }}
        />
      </Card>

      <Divider />

      <Space wrap>
        <Button onClick={() => { formRef.current?.setValue('name', 'John Doe'); refreshSnapshot() }}>
          Fill Name
        </Button>
        <Button onClick={() => { formRef.current?.setValue('email', 'john@example.com'); refreshSnapshot() }}>
          Fill Email
        </Button>
        <Button onClick={() => {
          formRef.current?.setValue('name', 'Jane Smith')
          formRef.current?.setValue('email', 'jane@example.com')
          formRef.current?.setValue('bio', 'Full-stack developer')
          refreshSnapshot()
        }}>
          Fill All
        </Button>
        <Button onClick={() => { formRef.current?.setValue('name', ''); refreshSnapshot() }}>
          Clear Name
        </Button>
        <Button onClick={refreshSnapshot}>
          Refresh Snapshot
        </Button>
      </Space>

      {snapshot && (
        <Card style={{ marginTop: 16, background: '#f6f6f6' }}>
          <Text strong>Current values:</Text>
          <pre style={{ marginTop: 8, fontSize: 13 }}>
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}

export const SetValue: StoryObj = {
  render: () => <SetValueExample />,
}
