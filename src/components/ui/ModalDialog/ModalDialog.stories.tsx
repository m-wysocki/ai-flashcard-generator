import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { ModalDialog, ModalDialogClose } from "./ModalDialog";

const meta = {
  component: ModalDialog,
  tags: ["ai-generated"],
  argTypes: {
    trigger: { control: false },
    children: { control: false },
    actions: { control: false },
    onOpenChange: { action: "openChange" },
  },
} satisfies Meta<typeof ModalDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    trigger: <Button type="button">Open modal</Button>,
    title: "Podstawowy modal",
    description: "To jest bazowy widok dialogu z nagłówkiem i opisem.",
    children: <p>Treść modala.</p>,
  },
};

export const Form: Story = {
  args: {
    trigger: <Button type="button">Edytuj fiszkę</Button>,
    title: "Edytuj fiszkę",
    children: null,
  },
  render: () => {
    const [pending, setPending] = useState(false);

    return (
      <ModalDialog
        trigger={<Button type="button">Edytuj fiszkę</Button>}
        title="Edytuj fiszkę"
        description="Zmień pola i zapisz."
      >
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPending(true);
            setTimeout(() => setPending(false), 300);
          }}
        >
          <Field name="front" label="Przód" defaultValue="Nie wiem" required />
          <Field name="back" label="Tył" defaultValue="I don't know" required />
          <Field
            as="textarea"
            name="notes"
            label="Notatki"
            defaultValue="Krótka notatka"
            rows={3}
          />
          <Button type="submit" color="primary" disabled={pending}>
            {pending ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </form>
      </ModalDialog>
    );
  },
};

export const Confirm: Story = {
  args: {
    trigger: <Button type="button">Usuń fiszkę</Button>,
    title: "Usunąć fiszkę?",
    children: null,
  },
  render: () => (
    <ModalDialog
      trigger={
        <Button type="button" color="secondary">
          Usuń fiszkę
        </Button>
      }
      title="Usunąć fiszkę?"
      description="Tej operacji nie da się cofnąć."
      actions={
        <>
          <ModalDialogClose asChild>
            <Button type="button">Anuluj</Button>
          </ModalDialogClose>
          <Button type="button" color="secondary">
            Usuń
          </Button>
        </>
      }
    >
      <p>Czy na pewno chcesz usunąć tę fiszkę?</p>
    </ModalDialog>
  ),
};
