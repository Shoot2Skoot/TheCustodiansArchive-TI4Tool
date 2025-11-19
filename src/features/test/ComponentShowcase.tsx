import { useState } from 'react';
import { Button, Input, Panel, Modal, useToast } from '@/components/common';

export function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { showToast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <Panel>
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-secondary)' }}>
          Button Components
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>

        <h4 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>Sizes</h4>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>

        <h4 style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-3)' }}>
          With Icons
        </h4>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button icon="→">Next</Button>
          <Button icon="✓" variant="secondary">
            Confirm
          </Button>
          <Button iconOnly icon="✕" variant="ghost" aria-label="Close" />
        </div>
      </Panel>

      <Panel>
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-secondary)' }}>
          Input Components
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Player Name"
            placeholder="Enter your name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="This will be displayed to other players"
          />

          <Input label="Room Code" placeholder="ALPHA7" error="Invalid room code" />

          <Input label="Disabled Input" placeholder="Cannot edit" disabled />
        </div>
      </Panel>

      <Panel>
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-secondary)' }}>
          Panel Variants
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Panel variant="default" padding="small">
            <strong>Default Panel</strong> - Standard background with shadow
          </Panel>
          <Panel variant="elevated" padding="small">
            <strong>Elevated Panel</strong> - Raised appearance with deeper shadow
          </Panel>
          <Panel variant="bordered" padding="small">
            <strong>Bordered Panel</strong> - Accent border highlight
          </Panel>
          <Panel beveled={false} padding="small">
            <strong>Non-Beveled Panel</strong> - Square corners
          </Panel>
        </div>
      </Panel>

      <Panel>
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-secondary)' }}>
          Modal & Toast
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Button variant="secondary" onClick={() => showToast('success', 'Success! Operation completed.')}>
            Show Success Toast
          </Button>
          <Button variant="secondary" onClick={() => showToast('error', 'Error! Something went wrong.')}>
            Show Error Toast
          </Button>
          <Button variant="secondary" onClick={() => showToast('info', 'Info: Here is some information.')}>
            Show Info Toast
          </Button>
          <Button variant="secondary" onClick={() => showToast('warning', 'Warning: Please be careful.')}>
            Show Warning Toast
          </Button>
        </div>
      </Panel>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              showToast('success', 'Modal action confirmed!');
              setIsModalOpen(false);
            }}>
              Confirm
            </Button>
          </>
        }
      >
        <p>This is a modal dialog with a title, content, and footer actions.</p>
        <p>
          You can close it by clicking the X button, the overlay, pressing Escape, or using the
          footer buttons.
        </p>
        <Input label="Test Input in Modal" placeholder="Type something..." />
      </Modal>
    </div>
  );
}
