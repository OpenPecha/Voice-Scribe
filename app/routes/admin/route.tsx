import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { prisma } from "~/db.server";
import { Role } from "@prisma/client";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
  MenubarSeparator,
} from "~/components/ui/menubar";
import UsersPage from "~/routes/admin/users";
import AudioFilesPage from "~/routes/admin/audiofiles";
import Reports from "~/routes/admin/reports";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const session = url.searchParams.get("session");
  console.log(session);

  if (!session) return redirect("/error");

  const user = await prisma.user.findUnique({
    where: { email: session },
    select: { id: true, role: true, username: true },
  });

  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  const users = await prisma.user.findMany();
  const recordings = await prisma.recording.findMany({
    include: { modified_by: true, reviewed_by: true },
  });

  return { user, users, recordings };
};

function AdminRoute() {
  const { user, users, recordings } = useLoaderData();

  return (
    <div className="bg-gray-300 text-black h-screen pt-3 overflow-scroll">
      <div className="flex justify-center m-3">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Admin</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Welcome, {user.username} - {user.role}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Dashboard</MenubarItem>
              <MenubarItem>
                <Link
                  to="/admin/users"
                  className="hover:underline text-blue-500"
                >
                  Go to Users
                </Link>
              </MenubarItem>
              <MenubarItem>
                <Link
                  to="/admin/audiofiles"
                  className="hover:underline text-blue-500"
                >
                  Audio Files
                </Link>
              </MenubarItem>
              <MenubarItem>Settings</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      <hr />
      <UsersPage users={users} />
      <AudioFilesPage recordings={recordings} />
      <Reports recordings={recordings} />
    </div>
  );
}

export default AdminRoute;