import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/')({component: HomeFallback});
function HomeFallback() {
  return <main style={{fontFamily:'Arial,sans-serif',padding:48,color:'#132C40'}}><h1>Florida Pure Solutions</h1><p>Better water. A better day at home.</p><a href="/">Open the website</a></main>;
}
