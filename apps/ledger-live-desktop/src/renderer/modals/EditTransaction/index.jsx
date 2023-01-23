// @flow

import React, { useCallback, useState } from "react";
import Modal from "~/renderer/components/Modal";
import Body from "./Body";
import type { StepId } from "./types";

type Props = {
  stepId: StepId,
  onClose: Function,
};

const MODAL_LOCKED: { [_: StepId]: boolean } = {
  recipient: true,
  amount: true,
  summary: true,
  device: true,
  confirmation: true,
};

const SendModal = ({ stepId: initialStepId, onClose }: Props) => {
  const [stepId, setStep] = useState(() => initialStepId || "method");
  const handleReset = useCallback(() => setStep("method"), []);
  const handleStepChange = useCallback(stepId => setStep(stepId), []);
  const isModalLocked = MODAL_LOCKED[stepId];
  return (
    <Modal
      name="MODAL_EDIT_TRANSACTION"
      centered
      refocusWhenChange={stepId}
      onHide={handleReset}
      onClose={onClose}
      preventBackdropClick={isModalLocked}
      render={({ onClose, data }) => (
        <Body
          stepId={stepId}
          onClose={onClose}
          onChangeStepId={handleStepChange}
          params={data || {}}
        />
      )}
    />
  );
};

export default SendModal;
