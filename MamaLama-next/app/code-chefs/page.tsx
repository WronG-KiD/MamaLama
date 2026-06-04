import { redirect } from 'next/navigation';

// Old route — keep this as a redirect in case the old URL was shared anywhere.
export default function CodeChefsRedirect() {
  redirect('/code-cubs');
}
