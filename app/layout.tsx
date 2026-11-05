import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                var reason = event.reason ? (event.reason.message || event.reason.name || '') : '';
                if (reason.toLowerCase().includes('abort') || reason.includes('signal is aborted')) {
                  event.preventDefault(); // Stop browser console error
                  event.stopImmediatePropagation(); // Hide from Next.js error overlay
                }
              }, { capture: true }); // 'capture: true' guarantees this runs first
            `,
          }}
        />
      </head>
      <body>
        <Navbar />
        <div className="flex-1 overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
