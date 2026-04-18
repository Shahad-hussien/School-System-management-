<template>
  <div class="flex min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
    <AppSidebar />

    <main class="flex-1 flex flex-col">
      <header
        class="h-16 bg-primary-800 shadow-md flex items-center justify-between px-8 text-white"
      >
        <h2 class="text-lg font-semibold">مرحباً بك في لوحة الإدارة</h2>

        <YearSelector />
      </header>

      <div class="p-8 flex-1 overflow-y-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
