/** @jsxImportSource npm:react@18.2.0 */
import { read } from "lume/core/utils/read.ts";

const logo = `data:image/svg+xml;base64,${btoa(await read('src/assets/images/logo.svg'))}`;

export default function ({ title, description }) {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                padding: "40px 100px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                color: "#F4F3F2",
                background: "#262626",
                fontSize: 48,
                fontFamily: "Denim INK",
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: "50px",
                width: "100%",
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 1
                }}>
                    <div style={{
                        padding: 0,
                        margin: 0,
                        fontSize: "1.5em",
                        fontWeight: "bold"
                    }}>{title}</div>
                    <div>{description}</div>
                </div>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: "20px",
                width: "100%",
                alignItems: "center",
            }}>
                <img src={ logo } style={{
                    width: "2.2em",
                }}/>
                <div style={{
                    fontWeight: "bold",
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: 1,
                    flexGrow: 1,
                }}>
                    <span style={{
                        // fontSize: "1.2em",
                        textTransform: "uppercase",
                    }}>Bradford 2025</span>
                    <span style={{
                        fontWeight: '100'
                    }}>UK City of Culture</span>
                </div>
                <div style={{
                    color: "#717171",
                    fontWeight: "bold",
                    lineHeight: 1,
                }}>Data Dashboard</div>
            </div>
        </div>
    );
}
