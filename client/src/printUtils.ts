import axios from 'axios';
import toast from 'react-hot-toast';

export const printLabel = async (type: 'PACKAGE' | 'PALLET', number: string) => {
  try {
    const response = await axios.get(`/api/label-templates/default/${type}`);
    const template = response.data;

    if (!template) {
      toast.error('Brak szablonu etykiety. Skonfiguruj go w Panelu Admina.');
      return;
    }

    let html = template.htmlContent;
    // Zamiana placeholderów
    html = html.replace(/{{number}}/g, number);
    html = html.replace(/{{date}}/g, new Date().toLocaleDateString());

    const printWindow = window.open('', '_blank', 'width=400,height=400');
    if (!printWindow) {
      toast.error('Zablokowano wyskakujące okienko!');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Drukuj Etykietę - ${number}</title>
          <style>
            @page { size: auto; margin: 0; }
            body { margin: 10px; font-family: sans-serif; }
            ${template.cssContent}
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (err) {
    console.error('Print error:', err);
    toast.error('Błąd podczas generowania etykiety');
  }
};
