import { RouterProvider } from 'react-router';
import { router } from './routes';
import { EditorToggle } from '../editor/EditorToggle';
import { EditorToolbar } from '../editor/EditorToolbar';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <EditorToggle />
      <EditorToolbar />
    </>
  );
}
