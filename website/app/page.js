"use client"
import React, { useEffect, useState } from 'react'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import app from '@/config'

const page = () => {
  const auth = getAuth()
  const router = useRouter();
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push("/sign-in")
      }
    })
    return () => unsubscribe();
  }, [auth, router])

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/sign-in")
    } catch (error) {
      console.error("Error siging out :", error.message)
    }
  }

  return (
    // <div className='flex flex-col items-center justify-center h-screen'>
    //     <div className='p-8 rounded-lg shadow-md'>
    //         <h1 className='text-3xl font-bold mb-4'>
    //             Welcome to Dashboard {user  ? user.displayName : "Guest"}!
    //         </h1>
    //         <button onClick={handleLogout} className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
    //             Logout
    //         </button>
    //     </div>

    // </div>
    <>
    <div className='h-screen'>
      <header className=" w-full">
        <nav className="bg-white border-gray-200 py-2.5 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto h-full">
            <a href="#" className="flex items-center">
              <img src="https://demo.themesberg.com/landwind/images/logo.svg" className="h-6 mr-3 sm:h-9" alt="Landwind Logo" />
              <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Landwind</span>
            </a>
           
            <div className="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-white bg-purple-700 rounded lg:bg-transparent lg:text-purple-700 lg:p-0 dark:text-white"
                    aria-current="page">Home</a>
                </li>
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Company</a>
                </li>
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Marketplace</a>
                </li>
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Features</a>
                </li>
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Team</a>
                </li>
                <li>
                  <a href="#"
                    className="block py-2 pl-3 pr-4 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-purple-700 lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <section className="bg-white dark:bg-gray-900 h-full">
        <div className="grid max-w-screen-xl px-4 pt-20 pb-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:pt-28">
          <div className="mr-auto place-self-center lg:col-span-7">
            <h1
              className="max-w-2xl mb-4 text-4xl font-extrabold leading-none tracking-tight md:text-5xl xl:text-6xl dark:text-white">
              Welcome to <br />Home page</h1>
            <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">{user  ? user.displayName : "Guest"}!
            </p>
            <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
             
              <button href="https://www.figma.com/community/file/1125744163617429490" target="_blank"
                className="inline-flex items-center justify-center w-full px-5 py-3 mb-2 mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:w-auto focus:outline-none hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={handleLogout}>
                <svg className="w-4 h-4 mr-2" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"
                  width="1667" height="2500">

                  <title>Figma.logo</title>
                  <desc>Created using Figma</desc>
                  <path id="path0_fill" className="st0"
                    d="M50 300c27.6 0 50-22.4 50-50v-50H50c-27.6 0-50 22.4-50 50s22.4 50 50 50z" />
                  <path id="path1_fill" className="st1"
                    d="M0 150c0-27.6 22.4-50 50-50h50v100H50c-27.6 0-50-22.4-50-50z" />
                  <path id="path1_fill_1_" className="st2"
                    d="M0 50C0 22.4 22.4 0 50 0h50v100H50C22.4 100 0 77.6 0 50z" />
                  <path id="path2_fill" className="st3"
                    d="M100 0h50c27.6 0 50 22.4 50 50s-22.4 50-50 50h-50V0z" />
                  <path id="path3_fill" className="st4"
                    d="M200 150c0 27.6-22.4 50-50 50s-50-22.4-50-50 22.4-50 50-50 50 22.4 50 50z" />
                </svg> LogOut
              </button>
            </div>
          </div>
          <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
            <img src="https://demo.themesberg.com/landwind/images/hero.png" alt="hero image" />
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default page