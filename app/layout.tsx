export const metadata = {
  title: 'Tradutor Neox',
  description: 'Tradutor de textos com síntese de voz',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
