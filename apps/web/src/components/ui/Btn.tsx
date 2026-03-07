"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./Button";

export type BtnProps = ButtonProps;

export function Btn(props: BtnProps) {
  return <Button {...props} />;
}
