export { default } from "next-auth/middleware";

export const config = {
  // Ici on liste toutes les routes à protéger.
  // Le pattern matcher permet de dire : "Tout ce qui commence par /catalogue ou /scan"
//   matcher: ["/catalogue/:path*", "/scan/:path*", "/"],
    matcher: ["/mouvements/:path*", "/scan/:path*","/catalogue/nouveau"],
};