// @flow

import React, { PureComponent, useState } from "react";
import { Trans } from "react-i18next";
import Box from "~/renderer/components/Box";
import Button from "~/renderer/components/Button";
import styled from "styled-components";
import CheckBox from "~/renderer/components/CheckBox";
import Text from "~/renderer/components/Text";
import type { StepProps } from "../types";

const FeesWrapper = styled(Box)`
  border: ${p =>
    `1px solid ${
      p.selected ? p.theme.colors.palette.primary.main : p.theme.colors.palette.divider
    }`};
  ${p => (p.selected ? "box-shadow: 0px 0px 0px 4px rgba(138, 128, 219, 0.3);" : "")}
  padding: 20px 16px;
  width: 100%;
  font-family: "Inter";
  border-radius: 4px;
  &:hover {
    cursor: "pointer";
  }
`;
const FeesHeader = styled(Box)`
  color: ${p =>
    p.selected ? p.theme.colors.palette.primary.main : p.theme.colors.palette.text.shade50};
`;

const Description = styled.div`
  font-size: 10px;
  margin-left: 20px;
  color: ${p => (p.selected ? "white" : "gray")};
`;

const StepMethod = ({ t }: StepProps) => {
  const [editType, setEditType] = useState("speedup");
  const isCancel = editType === "cancel";
  return (
    <Box flow={4}>
      <FeesWrapper
        key={0}
        selected={!isCancel}
        onClick={() => {
          setEditType("speedup");
        }}
      >
        <FeesHeader horizontal alignItems="center" selected={!isCancel}>
          <CheckBox isChecked={!isCancel} />
          <Text fontSize={12} ff="Inter|ExtraBold" uppercase ml={1}>
            <Trans i18nKey={"operation.edit.speedUp.title"} />
          </Text>
        </FeesHeader>
        <Description selected={editType === "speedup"}>
          <Trans i18nKey={"operation.edit.speedUp.description"} />
        </Description>
      </FeesWrapper>
      <FeesWrapper
        key={1}
        selected={isCancel}
        onClick={() => {
          setEditType("cancel");
        }}
      >
        <FeesHeader horizontal alignItems="center" selected={isCancel}>
          <CheckBox isChecked={editType === "cancel"} />
          <Text fontSize={12} ff="Inter|ExtraBold" uppercase ml={1}>
            <Trans i18nKey={"operation.edit.cancel.title"} />
          </Text>
        </FeesHeader>
        <Description selected={isCancel}>
          <Trans i18nKey={"operation.edit.cancel.description"} />
        </Description>
      </FeesWrapper>
    </Box>
  );
};

export class StepMethodFooter extends PureComponent<StepProps> {
  onNext = async () => {
    const { transitionTo } = this.props;
    transitionTo("fees");
  };

  render() {
    const { t } = this.props;
    return (
      <>
        <Button
          id={"send-recipient-continue-button"}
          primary
          disabled={false}
          onClick={this.onNext}
        >
          {t("common.continue")}
        </Button>
      </>
    );
  }
}

export default StepMethod;
