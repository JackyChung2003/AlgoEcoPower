const people = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'Housewife',
      imageUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'David Smith',
      email: ' david.smith@example.com',
      role: 'Electrician',
      imageUrl:
        'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Maria Rodriguez',
      email: 'maria.rodriguez@example.com',
      role: 'Florist',
      imageUrl:
        'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
      lastSeen: null,
    },
    {
      name: 'Michael Lee',
      email: 'michael.lee@example.com',
      role: 'Accountant',
      imageUrl:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: 'Emily Brown',
      email: 'emily.brown@example.com',
      role: 'Designer',
      imageUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: '3h ago',
      lastSeenDateTime: '2023-01-23T13:23Z',
    },
    {
      name: ' Daniel Davis',
      email: ' daniel.davis@example.com',
      role: 'Director of Product',
      imageUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      lastSeen: null,
    },
  ]
  
  export default function Community() {
    return (
      <div className="container mx-auto">
        <ul className="divide-y divide-gray-100">
         {people.map((person) => (
           <li key={person.email} className="flex justify-between gap-x-6 py-5">
             <div className="flex min-w-0 gap-x-4">
               <img className="h-12 w-12 flex-none rounded-full bg-gray-50" src={person.imageUrl} alt="" />
               <div className="min-w-0 flex-auto">
                 <p className="text-sm font-semibold leading-6 text-gray-50">{person.name}</p>
                 <p className="mt-1 truncate text-xs leading-5 text-gray-400">{person.email}</p>
               </div>
             </div>
             <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
               <p className="text-sm leading-6 text-gray-200">{person.role}</p>
               {person.lastSeen ? (
                 <p className="mt-1 text-xs leading-5 text-gray-500">
                   Last purchased <time dateTime={person.lastSeenDateTime}>{person.lastSeen}</time>
                 </p>
               ) : (
                 <div className="mt-1 flex items-center gap-x-1.5">
                   <div className="flex-none rounded-full bg-emerald-500/20 p-1">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                   </div>
                   <p className="text-xs leading-5 text-gray-500">Exploring the ultimate energy secret...</p>
                 </div>
               )}
             </div>
           </li>
         ))}
       </ul>
      </div>
      
    )
  }
  