import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    className="icon"
    viewBox="0 0 1024 1024"
    fill={'currentColor'}
    {...props}
  >
    <path d="M165.12 156.075a85.333 85.333 0 0 1 84.139-70.742h525.568a85.333 85.333 0 0 1 84.053 70.742l78.55 452.522a85.333 85.333 0 0 1 1.28 14.592v230.144a85.333 85.333 0 0 1-85.334 85.334h-682.71a85.333 85.333 0 0 1-85.333-85.334V623.19c0-4.864.427-9.77 1.28-14.592l78.507-452.522zm609.707 14.592H249.173l-66.56 384h658.774l-66.646-384zm-604.16 682.666h682.666V640H170.667v213.333zM704 704a42.667 42.667 0 1 0 0 85.333h38.4a42.667 42.667 0 1 0 0-85.333H704z" />
  </svg>
)
export default SvgComponent
