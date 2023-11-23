import * as React from "react"
import { SVGProps } from "react"
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    className="icon"
    viewBox="0 0 1024 1024"
    {...props}
  >
    <path d="M950.144 827.093H73.856A73.813 73.813 0 0 1 .043 753.28V270.72a73.813 73.813 0 0 1 73.813-73.813h876.288a73.813 73.813 0 0 1 73.813 73.813v482.475a73.813 73.813 0 0 1-73.813 73.856zm-704-147.712v-192l98.475 123.094L443.05 487.38v192h98.474v-334.72h-98.474l-98.432 123.094-98.475-123.094h-98.475v334.806zM905.856 512h-98.475V344.619H708.95V512h-98.474l147.669 172.33z" />
  </svg>
)
export default SvgComponent
