import { VSCodeButton, VSCodeCheckbox, VSCodeLink, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "../../utils/validate"
import { vscode } from "../../utils/vscode"
import ApiOptions from "./ApiOptions"
import McpEnabledToggle from "../mcp/McpEnabledToggle"
import ApiConfigManager from "./ApiConfigManager"

const IS_DEV = false // FIXME: use flags when packaging

type SettingsViewProps = {
	onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
	const {
		apiConfiguration,
		version,
		customInstructions,
		setCustomInstructions,
		alwaysAllowReadOnly,
		setAlwaysAllowReadOnly,
		alwaysAllowWrite,
		setAlwaysAllowWrite,
		alwaysAllowExecute,
		setAlwaysAllowExecute,
		alwaysAllowBrowser,
		setAlwaysAllowBrowser,
		alwaysAllowMcp,
		setAlwaysAllowMcp,
		soundEnabled,
		setSoundEnabled,
		soundVolume,
		setSoundVolume,
		diffEnabled,
		setDiffEnabled,
		browserViewportSize,
		setBrowserViewportSize,
		openRouterModels,
		glamaModels,
		setAllowedCommands,
		allowedCommands,
		fuzzyMatchThreshold,
		setFuzzyMatchThreshold,
		preferredLanguage,
		setPreferredLanguage,
		writeDelayMs,
		setWriteDelayMs,
		screenshotQuality,
		setScreenshotQuality,
		terminalOutputLineLimit,
		setTerminalOutputLineLimit,
		mcpEnabled,
		alwaysApproveResubmit,
		setAlwaysApproveResubmit,
		requestDelaySeconds,
		setRequestDelaySeconds,
		currentApiConfigName,
		listApiConfigMeta,
	} = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [commandInput, setCommandInput] = useState("")

	const handleSubmit = () => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, glamaModels, openRouterModels)

		setApiErrorMessage(apiValidationResult)
		setModelIdErrorMessage(modelIdValidationResult)
		if (!apiValidationResult && !modelIdValidationResult) {
			vscode.postMessage({
				type: "apiConfiguration",
				apiConfiguration
			})
			vscode.postMessage({ type: "customInstructions", text: customInstructions })
			vscode.postMessage({ type: "alwaysAllowReadOnly", bool: alwaysAllowReadOnly })
			vscode.postMessage({ type: "alwaysAllowWrite", bool: alwaysAllowWrite })
			vscode.postMessage({ type: "alwaysAllowExecute", bool: alwaysAllowExecute })
			vscode.postMessage({ type: "alwaysAllowBrowser", bool: alwaysAllowBrowser })
			vscode.postMessage({ type: "alwaysAllowMcp", bool: alwaysAllowMcp })
			vscode.postMessage({ type: "allowedCommands", commands: allowedCommands ?? [] })
			vscode.postMessage({ type: "soundEnabled", bool: soundEnabled })
			vscode.postMessage({ type: "soundVolume", value: soundVolume })
			vscode.postMessage({ type: "diffEnabled", bool: diffEnabled })
			vscode.postMessage({ type: "browserViewportSize", text: browserViewportSize })
			vscode.postMessage({ type: "fuzzyMatchThreshold", value: fuzzyMatchThreshold ?? 1.0 })
			vscode.postMessage({ type: "preferredLanguage", text: preferredLanguage })
			vscode.postMessage({ type: "writeDelayMs", value: writeDelayMs })
			vscode.postMessage({ type: "screenshotQuality", value: screenshotQuality ?? 75 })
			vscode.postMessage({ type: "terminalOutputLineLimit", value: terminalOutputLineLimit ?? 500 })
			vscode.postMessage({ type: "mcpEnabled", bool: mcpEnabled })
			vscode.postMessage({ type: "alwaysApproveResubmit", bool: alwaysApproveResubmit })
			vscode.postMessage({ type: "requestDelaySeconds", value: requestDelaySeconds })
			vscode.postMessage({ type: "currentApiConfigName", text: currentApiConfigName })
			vscode.postMessage({
				type: "upsertApiConfiguration",
				text: currentApiConfigName,
				apiConfiguration
			})

			onDone()
		}
	}

	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// Initial validation on mount
	useEffect(() => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, glamaModels, openRouterModels)
		setApiErrorMessage(apiValidationResult)
		setModelIdErrorMessage(modelIdValidationResult)
	}, [apiConfiguration, glamaModels, openRouterModels])

	const handleResetState = () => {
		vscode.postMessage({ type: "resetState" })
	}

	const handleAddCommand = () => {
		const currentCommands = allowedCommands ?? []
		if (commandInput && !currentCommands.includes(commandInput)) {
			const newCommands = [...currentCommands, commandInput]
			setAllowedCommands(newCommands)
			setCommandInput("")
			vscode.postMessage({
				type: "allowedCommands",
				commands: newCommands
			})
		}
	}

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				padding: "10px 0px 0px 20px",
				display: "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "17px",
					paddingRight: 17,
				}}>

				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>Settings</h3>
				<VSCodeButton onClick={handleSubmit}>Done</VSCodeButton>
			</div>
			<div
				style={{ flexGrow: 1, overflowY: "scroll", paddingRight: 8, display: "flex", flexDirection: "column" }}>
				<div style={{ marginBottom: 5 }}>
					<h3 style={{ color: "var(--vscode-foreground)", margin: 0, marginBottom: 15 }}>Provider Settings</h3>
					<ApiConfigManager
						currentApiConfigName={currentApiConfigName}
						listApiConfigMeta={listApiConfigMeta}
						onSelectConfig={(configName: string) => {
							vscode.postMessage({
								type: "loadApiConfiguration",
								text: configName
							})
						}}
						onDeleteConfig={(configName: string) => {
							vscode.postMessage({
								type: "deleteApiConfiguration",
								text: configName
							})
						}}
						onRenameConfig={(oldName: string, newName: string) => {
							vscode.postMessage({
								type: "renameApiConfiguration",
								values: { oldName, newName },
								apiConfiguration
							})
						}}
						onUpsertConfig={(configName: string) => {
							vscode.postMessage({
								type: "upsertApiConfiguration",
								text: configName,
								apiConfiguration
							})
						}}
					/>
					<ApiOptions
						apiErrorMessage={apiErrorMessage}
						modelIdErrorMessage={modelIdErrorMessage}
					/>
				</div>

				<div style={{ marginBottom: 5 }}>
					<div style={{ marginBottom: 15 }}>
						<h3 style={{ color: "var(--vscode-foreground)", margin: 0, marginBottom: 15 }}>Agent（智能体） 设置</h3>

						<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>首选语言</label>
						<select
							value={preferredLanguage}
							onChange={(e) => setPreferredLanguage(e.target.value)}
							style={{
								width: "100%",
								padding: "4px 8px",
								backgroundColor: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)",
								border: "1px solid var(--vscode-input-border)",
								borderRadius: "2px",
								height: "28px"
							}}>
							<option value="English">English</option>
							<option value="Arabic">Arabic - العربية</option>
							<option value="Brazilian Portuguese">Portuguese - Português (Brasil)</option>
							<option value="Czech">Czech - Čeština</option>
							<option value="French">French - Français</option>
							<option value="German">German - Deutsch</option>
							<option value="Hindi">Hindi - हिन्दी</option>
							<option value="Hungarian">Hungarian - Magyar</option>
							<option value="Italian">Italian - Italiano</option>
							<option value="Japanese">Japanese - 日本語</option>
							<option value="Korean">Korean - 한국어</option>
							<option value="Polish">Polish - Polski</option>
							<option value="Portuguese">Portuguese - Português (Portugal)</option>
							<option value="Russian">Russian - Русский</option>
							<option value="Simplified Chinese">Simplified Chinese - 简体中文</option>
							<option value="Spanish">Spanish - Español</option>
							<option value="Traditional Chinese">Traditional Chinese - 繁體中文</option>
							<option value="Turkish">Turkish - Türkçe</option>
						</select>
						<p style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
							选择Cline应该用于交流的语言.
						</p>
					</div>

					<VSCodeTextArea
						value={customInstructions ?? ""}
						style={{ width: "100%" }}
						rows={4}
						placeholder={
							'e.g. "Run unit tests at the end", "Use TypeScript with async/await", "Speak in Spanish"'
						}
						onInput={(e: any) => setCustomInstructions(e.target?.value ?? "")}>
						<span style={{ fontWeight: "500" }}>Custom Instructions</span>
					</VSCodeTextArea>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						这些指令被添加到与每个请求一起发送的系统提示符的末尾. 自定义指令设置在 .clinerules 和 .cursorrules 在工作目录中也包括在内.
					</p>

					<McpEnabledToggle />
				</div>

				<div style={{ marginBottom: 5 }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
						<span style={{ fontWeight: "500", minWidth: '150px' }}>Terminal output limit</span>
						<input
							type="range"
							min="100"
							max="5000"
							step="100"
							value={terminalOutputLineLimit ?? 500}
							onChange={(e) => setTerminalOutputLineLimit(parseInt(e.target.value))}
							style={{
								flexGrow: 1,
								accentColor: 'var(--vscode-button-background)',
								height: '2px'
							}}
						/>
						<span style={{ minWidth: '45px', textAlign: 'left' }}>
							{terminalOutputLineLimit ?? 500}
						</span>
					</div>
					<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
						Maximum number of lines to include in terminal output when executing commands. When exceeded lines will be removed from the middle, saving tokens.
					</p>
				</div>

				<div style={{ marginBottom: 5 }}>
					<VSCodeCheckbox checked={diffEnabled} onChange={(e: any) => setDiffEnabled(e.target.checked)}>
						<span style={{ fontWeight: "500" }}>Enable editing through diffs</span>
					</VSCodeCheckbox>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						When enabled, Cline will be able to edit files more quickly and will automatically reject truncated full-file writes. Works best with the latest Claude 3.5 Sonnet model.
					</p>

					{diffEnabled && (
						<div style={{ marginTop: 10 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
								<span style={{ fontWeight: "500", minWidth: '100px' }}>Match precision</span>
								<input
									type="range"
									min="0.8"
									max="1"
									step="0.005"
									value={fuzzyMatchThreshold ?? 1.0}
									onChange={(e) => {
										setFuzzyMatchThreshold(parseFloat(e.target.value));
									}}
									style={{
										flexGrow: 1,
										accentColor: 'var(--vscode-button-background)',
										height: '2px'
									}}
								/>
								<span style={{ minWidth: '35px', textAlign: 'left' }}>
									{Math.round((fuzzyMatchThreshold || 1) * 100)}%
								</span>
							</div>
							<p style={{ fontSize: "12px", marginBottom: 10, color: "var(--vscode-descriptionForeground)" }}>
								This slider controls how precisely code sections must match when applying diffs. Lower values allow more flexible matching but increase the risk of incorrect replacements. Use values below 100% with extreme caution.
							</p>
						</div>
					)}
				</div>

				<div style={{ marginBottom: 5 }}>
					<VSCodeCheckbox
						checked={alwaysAllowReadOnly}
						onChange={(e: any) => setAlwaysAllowReadOnly(e.target.checked)}>
						<span style={{ fontWeight: "500" }}>始终批准只读操作</span>
					</VSCodeCheckbox>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						启用后，Cline将自动查看目录内容并读取文件，而无需
						您单击批准按钮。
					</p>
				</div>

				<div style={{ marginBottom: 15, border: "2px solid var(--vscode-errorForeground)", borderRadius: "4px", padding: "10px" }}>
					<h4 style={{ fontWeight: 500, margin: "0 0 10px 0", color: "var(--vscode-errorForeground)" }}>⚠️ 高风险自动批准设置</h4>
					<p style={{ fontSize: "12px", marginBottom: 15, color: "var(--vscode-descriptionForeground)" }}>
					以下设置允许Cline自动执行潜在危险的操作，而无需批准。
					仅当您完全信任AI并了解相关的安全风险时，才启用这些设置。
					</p>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysAllowWrite}
							onChange={(e: any) => setAlwaysAllowWrite(e.target.checked)}>
							<span style={{ fontWeight: "500" }}>始终批准写入操作</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
						无需批准即可自动创建和编辑文件
						</p>
						{alwaysAllowWrite && (
							<div style={{ marginTop: 10 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<input
										type="range"
										min="0"
										max="5000"
										step="100"
										value={writeDelayMs}
										onChange={(e) => setWriteDelayMs(parseInt(e.target.value))}
										style={{
											flex: 1,
											accentColor: 'var(--vscode-button-background)',
											height: '2px'
										}}
									/>
									<span style={{ minWidth: '45px', textAlign: 'left' }}>
										{writeDelayMs}ms
									</span>
								</div>
								<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
								写入后延迟以允许诊断检测潜在问题
								</p>
							</div>
						)}
					</div>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysAllowBrowser}
							onChange={(e: any) => setAlwaysAllowBrowser(e.target.checked)}>
							<span style={{ fontWeight: "500" }}>始终批准浏览器操作</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
						    无需批准即可自动执行浏览器操作<br />
							Note: Only applies when the model supports computer use
						</p>
					</div>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysApproveResubmit}
							onChange={(e: any) => setAlwaysApproveResubmit(e.target.checked)}>
							<span style={{ fontWeight: "500" }}>总是重试失败的API请求</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
						当服务器返回错误响应时自动重试失败的API请求
						</p>
						{alwaysApproveResubmit && (
							<div style={{ marginTop: 10 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
									<input
										type="range"
										min="0"
										max="100"
										step="1"
										value={requestDelaySeconds}
										onChange={(e) => setRequestDelaySeconds(parseInt(e.target.value))}
										style={{
											flex: 1,
											accentColor: 'var(--vscode-button-background)',
											height: '2px'
										}}
									/>
									<span style={{ minWidth: '45px', textAlign: 'left' }}>
										{requestDelaySeconds}s
									</span>
								</div>
								<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
								重试请求前的延迟
								</p>
							</div>
						)}
					</div>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysAllowMcp}
							onChange={(e: any) => setAlwaysAllowMcp(e.target.checked)}>
							<span style={{ fontWeight: "500" }}>始终批准MCP工具</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
							Enable auto-approval of individual MCP tools in the MCP Servers view (requires both this setting and the tool's individual "Always allow" checkbox)
						</p>
					</div>

					<div style={{ marginBottom: 5 }}>
						<VSCodeCheckbox
							checked={alwaysAllowExecute}
							onChange={(e: any) => setAlwaysAllowExecute(e.target.checked)}>
							<span style={{ fontWeight: "500" }}>始终批准允许的执行操作</span>
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: "5px", color: "var(--vscode-descriptionForeground)" }}>
						无需批准即可自动执行允许的终端命令
						</p>

						{alwaysAllowExecute && (
							<div style={{ marginTop: 10 }}>
								<span style={{ fontWeight: "500" }}>允许的自动执行命令</span>
								<p style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
									启用“始终批准执行操作”时可以自动执行的命令前缀。
								</p>

								<div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
									<VSCodeTextField
										value={commandInput}
										onInput={(e: any) => setCommandInput(e.target.value)}
										onKeyDown={(e: any) => {
											if (e.key === 'Enter') {
												e.preventDefault()
												handleAddCommand()
											}
										}}
										placeholder="Enter command prefix (e.g., 'git ')"
										style={{ flexGrow: 1 }}
									/>
									<VSCodeButton onClick={handleAddCommand}>
										Add
									</VSCodeButton>
								</div>

								<div style={{
									marginTop: '10px',
									display: 'flex',
									flexWrap: 'wrap',
									gap: '5px'
								}}>
									{(allowedCommands ?? []).map((cmd, index) => (
										<div key={index} style={{
											display: 'flex',
											alignItems: 'center',
											gap: '5px',
											backgroundColor: 'var(--vscode-button-secondaryBackground)',
											padding: '2px 6px',
											borderRadius: '4px',
											border: '1px solid var(--vscode-button-secondaryBorder)',
											height: '24px'
										}}>
											<span>{cmd}</span>
											<VSCodeButton
												appearance="icon"
												style={{
													padding: 0,
													margin: 0,
													height: '20px',
													width: '20px',
													minWidth: '20px',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center'
												}}
												onClick={() => {
													const newCommands = (allowedCommands ?? []).filter((_, i) => i !== index)
													setAllowedCommands(newCommands)
													vscode.postMessage({
														type: "allowedCommands",
														commands: newCommands
													})
												}}
											>
												<span className="codicon codicon-close" />
											</VSCodeButton>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div style={{ marginBottom: 5 }}>
					<div style={{ marginBottom: 10 }}>
						<div style={{ marginBottom: 15 }}>
							<h3 style={{ color: "var(--vscode-foreground)", margin: 0, marginBottom: 15 }}>浏览器设置</h3>
							<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>视口大小</label>
							<select
								value={browserViewportSize}
								onChange={(e) => setBrowserViewportSize(e.target.value)}
								style={{
									width: "100%",
									padding: "4px 8px",
									backgroundColor: "var(--vscode-input-background)",
									color: "var(--vscode-input-foreground)",
									border: "1px solid var(--vscode-input-border)",
									borderRadius: "2px",
									height: "28px"
								}}>
								<option value="1280x800">Large Desktop (1280x800)</option>
								<option value="900x600">Small Desktop (900x600)</option>
								<option value="768x1024">Tablet (768x1024)</option>
								<option value="360x640">Mobile (360x640)</option>
							</select>
							<p style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
								选择浏览器交互的视口大小。这会影响网站的显示和交互方式.
							</p>
						</div>

						<div style={{ marginBottom: 15 }}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
								<span style={{ fontWeight: "500", minWidth: '100px' }}>截图质量</span>
								<input
									type="range"
									min="1"
									max="100"
									step="1"
									value={screenshotQuality ?? 75}
									onChange={(e) => setScreenshotQuality(parseInt(e.target.value))}
									style={{
										flexGrow: 1,
										accentColor: 'var(--vscode-button-background)',
										height: '2px'
									}}
								/>
								<span style={{ minWidth: '35px', textAlign: 'left' }}>
									{screenshotQuality ?? 75}%
								</span>
							</div>
							<p style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
								调整浏览器屏幕截图的WebP质量。更高的值提供更清晰的屏幕截图，但增加了令牌的使用。.
							</p>
						</div>
					</div>

					<div style={{ marginBottom: 5 }}>
						<div style={{ marginBottom: 10 }}>
							<h3 style={{ color: "var(--vscode-foreground)", margin: 0, marginBottom: 15 }}>通知设置</h3>
							<VSCodeCheckbox checked={soundEnabled} onChange={(e: any) => setSoundEnabled(e.target.checked)}>
								<span style={{ fontWeight: "500" }}>启用音效</span>
							</VSCodeCheckbox>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								启用后，Cline将为通知和事件播放音效.
							</p>
						</div>
						{soundEnabled && (
							<div style={{ marginLeft: 0 }}>
								<div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
									<span style={{ fontWeight: "500", minWidth: '100px' }}>Volume</span>
									<input
										type="range"
										min="0"
										max="1"
										step="0.01"
										value={soundVolume ?? 0.5}
										onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
										style={{
											flexGrow: 1,
											accentColor: 'var(--vscode-button-background)',
											height: '2px'
										}}
										aria-label="Volume"
									/>
									<span style={{ minWidth: '35px', textAlign: 'left' }}>
										{((soundVolume ?? 0.5) * 100).toFixed(0)}%
									</span>
								</div>
							</div>
						)}
					</div>
				</div>

				{IS_DEV && (
					<>
						<div style={{ marginTop: "10px", marginBottom: "4px" }}>Debug</div>
						<VSCodeButton onClick={handleResetState} style={{ marginTop: "5px", width: "auto" }}>
							Reset State
						</VSCodeButton>
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							This will reset all global state and secret storage in the extension.
						</p>
					</>
				)}

				<div
					style={{
						textAlign: "center",
						color: "var(--vscode-descriptionForeground)",
						fontSize: "12px",
						lineHeight: "1.2",
						marginTop: "auto",
						padding: "10px 8px 15px 0px",
					}}>
					<p style={{ wordWrap: "break-word", margin: 0, padding: 0 }}>
						If you have any questions or feedback, feel free to open an issue at{" "}
						<VSCodeLink href="https://github.com/RooVetGit/Bee-Cline" style={{ display: "inline" }}>
							https://github.com/RooVetGit/Bee-Cline
						</VSCodeLink>
					</p>
					<p style={{ fontStyle: "italic", margin: "10px 0 0 0", padding: 0 }}>v{version}</p>
				</div>
			</div>
		</div>
	)
}

export default memo(SettingsView)
