import React, { memo } from "react";
import { Page } from "../page/Page";
import { Text, Row, Button } from "@mpkelly/siam";
import { Panel } from "../../components/panel/Panel";
import { Setting } from "./Setting";
import { useSettings } from "./SettingsContext";

export interface SettingsPageProps {}

export const SettingsPage = memo(() => {
  const {
    settings,
    handleSettingsChange: updateSettings,
    handleExport,
    handleImportRef,
    handleImport,
    handleImportFile,
  } = useSettings();

  return (
    <Page p="lg" flexGrow={1}>
      <Text as="h1" labelKey="settings" />
      <Row flexGrow={1}>
        <Panel flexGrow={1} height={"100%"} flexDirection={"column"}>
          <Setting
            label="siteName"
            value={settings.siteName}
            onChange={(siteName: string) => updateSettings({ siteName })}
            description={""}
          />
          <input
            type="file"
            hidden
            ref={handleImportRef}
            onChange={handleImportFile}
          />
          <Row mt="xl">
            <Button onClick={handleExport} labelKey="exportData" kind="muted" />
            <Button
              onClick={handleImport}
              labelKey="importData"
              ml="md"
              kind="muted"
            />
          </Row>
        </Panel>
      </Row>
    </Page>
  );
});
