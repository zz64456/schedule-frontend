<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar - Enhanced -->
    <nav class="bg-gray-800 shadow-lg">
      <div class="max-w-full mx-auto px-4 md:px-6 lg:px-8">
        <div class="flex justify-between h-16 md:h-20">
          <div class="flex items-center">
            <h1 class="text-xl md:text-2xl font-bold text-white">藏琢診所班表系統</h1>
          </div>
          <div class="flex items-center space-x-2 md:space-x-4">
            <template v-if="!isAdmin">
              <button @click="handleLoginClick" class="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg font-medium">
                登入
              </button>
            </template>
            <template v-else>
              <span class="hidden md:inline text-gray-200 font-medium">{{ adminName }}</span>

              <!-- Management Dropdown -->
              <div class="relative management-dropdown">
                <button
                  @click="showManagementMenu = !showManagementMenu"
                  class="px-3 py-2 md:px-5 md:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg font-medium flex items-center gap-1 md:gap-2"
                >
                  <span class="hidden md:inline">管理</span>
                  <span class="md:hidden">⚙</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div
                  v-if="showManagementMenu"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                >
                  <button
                    @click="openAddEmployeeModal"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                  >
                    ➕ 新增員工
                  </button>
                  <button
                    @click="openAddDepartmentModal"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                  >
                    ➕ 新增部門
                  </button>
                </div>
              </div>

              <button v-if="!schedule?.is_confirmed" @click="confirmSchedule" class="px-3 py-2 md:px-5 md:py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all hover:shadow-lg font-medium text-sm md:text-base">
                <span class="hidden md:inline">確認該月班表</span>
                <span class="md:hidden">✓</span>
              </button>
              <button v-else @click="unconfirmSchedule" class="px-3 py-2 md:px-5 md:py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all hover:shadow-lg font-medium text-sm md:text-base">
                <span class="hidden md:inline">取消確認班表</span>
                <span class="md:hidden">↩</span>
              </button>
              <button @click="exportScheduleToPDF" class="px-3 py-2 md:px-5 md:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all hover:shadow-lg font-medium text-sm md:text-base">
                <span class="hidden md:inline">匯出班表</span>
                <span class="md:hidden">📥</span>
              </button>
              <button @click="logout" class="px-3 py-2 md:px-5 md:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all hover:shadow-lg font-medium text-sm md:text-base">
                <span class="hidden md:inline">登出</span>
                <span class="md:hidden">🚪</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content - Responsive Layout -->
    <div class="max-w-full mx-auto px-4 py-4 md:px-8 md:py-6 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
      <div class="flex flex-col md:flex-row gap-4 md:gap-8 w-full">
        <!-- Employee List Sidebar - Enhanced Card Design (Desktop Only) -->
        <div class="hidden md:flex md:flex-col md:w-56 lg:w-64 bg-white rounded-xl shadow-xl border-2 border-gray-200 h-[calc(100vh-8rem)]">
          <!-- Header Section (Fixed) -->
          <div class="p-4 lg:p-6 border-b-2 border-gray-200 flex-shrink-0">
            <h2 class="text-xl font-bold text-gray-800">選擇員工</h2>
          </div>

          <!-- Scrollable Content Section -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-6">
            <div v-for="(dept, index) in departments" :key="dept.id" :class="index > 0 ? 'mt-6 pt-6 border-t-2 border-gray-100' : ''">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg text-sm uppercase tracking-wide flex-1">{{ dept.name }}</h3>
                <button
                  v-if="isAdmin"
                  @click="deleteDepartment(dept)"
                  class="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                  title="刪除部門"
                >
                  🗑️
                </button>
              </div>
              <div class="space-y-2">
                <div
                  v-for="employee in dept.employees"
                  :key="employee.id"
                  class="flex items-center gap-2"
                >
                  <button
                    @click="selectEmployee(employee)"
                    :class="[
                      'flex-1 px-4 py-3 rounded-lg text-left transition-all font-medium',
                      selectedEmployee?.id === employee.id
                        ? 'ring-2 ring-offset-2 shadow-md'
                        : 'hover:bg-gray-50 hover:shadow-sm'
                    ]"
                    :style="{
                      backgroundColor: selectedEmployee?.id === employee.id ? employee.color + '20' : 'white',
                      borderLeft: `5px solid ${employee.color}`,
                      ringColor: employee.color
                    }"
                  >
                    <span class="flex items-center gap-2">
                      <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: employee.color }"></span>
                      {{ employee.name }}
                    </span>
                  </button>
                  <button
                    v-if="isAdmin"
                    @click="deleteEmployee(employee)"
                    class="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                    title="刪除員工"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Employee Selector (Mobile Only) -->
        <div class="block md:hidden bg-white rounded-xl shadow-xl border-2 border-gray-200 p-4">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">選擇員工</label>
            <button
              v-if="isAdmin"
              @click="showMobileDepartmentManager = !showMobileDepartmentManager"
              class="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-all font-medium"
            >
              {{ showMobileDepartmentManager ? '關閉' : '管理部門' }}
            </button>
          </div>

          <!-- Department Manager (Mobile) -->
          <div v-if="isAdmin && showMobileDepartmentManager" class="mb-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
            <p class="text-xs text-gray-600 mb-2 font-semibold">點擊部門名稱可刪除</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="dept in departments"
                :key="dept.id"
                @click="deleteDepartment(dept)"
                class="px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all"
              >
                {{ dept.name }} ({{ dept.employees.length }})
              </button>
            </div>
          </div>

          <div class="flex gap-2">
            <select
              :value="selectedEmployee?.id || ''"
              @change="handleMobileEmployeeSelect"
              class="flex-1 border-2 border-gray-300 rounded-lg px-4 py-3 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">請選擇員工</option>
              <optgroup v-for="dept in departments" :key="dept.id" :label="dept.name">
                <option
                  v-for="employee in dept.employees"
                  :key="employee.id"
                  :value="employee.id"
                >
                  {{ employee.name }}
                </option>
              </optgroup>
            </select>
            <button
              v-if="isAdmin && selectedEmployee"
              @click="deleteEmployee(selectedEmployee)"
              class="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium"
              title="刪除員工"
            >
              🗑️
            </button>
          </div>
        </div>

        <!-- Schedule Table - Enhanced -->
        <div v-if="selectedEmployee" class="w-full md:flex-1 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
          <div class="p-4 md:p-6">
            <!-- Year/Month Selector and Leave Type Buttons -->
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 md:p-4 mb-4 md:mb-6 shadow-sm border border-blue-100">
              <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                <!-- Year/Month Selection -->
                <div class="flex items-center gap-2 md:gap-3">
                  <label class="font-semibold text-gray-700 text-sm md:text-base">選擇年月：</label>
                  <select v-model="selectedYear" @change="loadSchedule" class="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                    <option v-for="y in years" :key="y" :value="y">{{ y }}年</option>
                  </select>
                  <select v-model="selectedMonth" @change="loadSchedule" class="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm md:text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                  </select>
                </div>

                <!-- Leave Type Buttons -->
                <div class="flex items-center gap-2 md:ml-4 pt-3 md:pt-0 border-t-2 md:border-t-0 md:border-l-2 border-blue-200 md:pl-4">
                  <label class="font-semibold text-gray-700 text-sm md:text-base">假別標記：</label>
                  <button
                    @click="toggleLeaveTypeMode('personal')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="[
                      'px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base',
                      schedule?.is_confirmed && !isAdmin
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        : leaveTypeMode === 'personal'
                          ? 'bg-yellow-500 text-white border-yellow-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                    ]"
                  >
                    事
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('sick')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="[
                      'px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base',
                      schedule?.is_confirmed && !isAdmin
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        : leaveTypeMode === 'sick'
                          ? 'bg-purple-500 text-white border-purple-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    ]"
                  >
                    病
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('hourly')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="[
                      'px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base',
                      schedule?.is_confirmed && !isAdmin
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        : leaveTypeMode === 'hourly'
                          ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    ]"
                  >
                    時
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('annual')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="[
                      'px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base',
                      schedule?.is_confirmed && !isAdmin
                        ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                        : leaveTypeMode === 'annual'
                          ? 'bg-green-500 text-white border-green-600 shadow-md'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                    ]"
                  >
                    年
                  </button>
                </div>

                <!-- Confirmed Badge -->
                <span v-if="schedule?.is_confirmed" class="md:ml-auto px-3 py-2 bg-green-100 text-green-800 rounded-lg font-semibold border-2 border-green-200 text-sm md:text-base text-center">
                  ✓ 已確認
                </span>
              </div>
            </div>

            <!-- Schedule Grid -->
            <div class="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table ref="scheduleTable" class="border-collapse border-2 border-gray-300 text-sm w-full">
                <thead>
                  <!-- Row 1: Year.Month and Days -->
                  <tr>
                    <th class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-3 bg-gray-100 sticky left-0 z-10 min-w-[100px] md:min-w-[150px] font-bold text-sm md:text-base">
                      {{ selectedYear }}.{{ selectedMonth }}
                    </th>
                    <th
                      v-for="day in daysInMonth"
                      :key="`day-${day}`"
                      :class="[
                        'border border-gray-300 px-2 md:px-3 py-2 min-w-[36px] md:min-w-[40px] font-semibold text-xs md:text-sm',
                        getDayOfWeek(day) === '日' ? '' : 'bg-gray-50'
                      ]"
                      :style="getDayOfWeek(day) === '日' ? { backgroundColor: '#f7caab' } : {}"
                    >
                      {{ day }}
                    </th>
                  </tr>
                  <!-- Row 2: Day of Week -->
                  <tr>
                    <th class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-3 bg-gray-100 sticky left-0 z-10 font-bold"></th>
                    <th
                      v-for="day in daysInMonth"
                      :key="`dow-${day}`"
                      :class="[
                        'border border-gray-300 px-2 md:px-3 py-2 font-semibold text-xs md:text-sm',
                        getDayOfWeek(day) === '日' ? '' : 'bg-gray-50'
                      ]"
                      :style="getDayOfWeek(day) === '日' ? { backgroundColor: '#f7caab' } : {}"
                    >
                      {{ getDayOfWeek(day) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Department and Employee Rows -->
                  <template v-for="dept in departments" :key="dept.id">
                    <tr>
                      <td class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-3 font-bold text-white sticky left-0 z-10 text-sm md:text-base relative" style="background-color: #f7caab;">
                        <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: #e5b89a;"></div>
                        {{ dept.name }}
                      </td>
                      <td
                        v-for="day in daysInMonth"
                        :key="`dept-${dept.id}-${day}`"
                        class="border border-gray-300 min-h-[36px] md:min-h-auto"
                        style="background-color: #f7caab;"
                      ></td>
                    </tr>
                    <tr
                      v-for="employee in dept.employees"
                      :key="employee.id"
                      :style="{
                        backgroundColor: selectedEmployee?.id === employee.id ? employee.color + '20' : 'white',
                        borderLeft: selectedEmployee?.id === employee.id ? `4px solid ${employee.color}` : '2px solid #d1d5db'
                      }"
                    >
                      <td
                        class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-2.5 sticky left-0 z-10 bg-white font-medium min-w-[100px] md:min-w-[150px]"
                      >
                        <span class="flex items-center gap-1 md:gap-2">
                          <span class="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full" :style="{ backgroundColor: employee.color }"></span>
                          <span class="text-xs md:text-sm">{{ employee.name }}</span>
                        </span>
                      </td>
                      <td
                        v-for="day in daysInMonth"
                        :key="`emp-${employee.id}-${day}`"
                        @mousedown="handleMouseDown(employee, day, $event)"
                        @mouseenter="handleMouseEnter(employee, day)"
                        @click.prevent="toggleDayOff(employee, day)"
                        :class="[
                          'border border-gray-300 transition-opacity select-none text-center font-bold text-base md:text-lg min-h-[44px] md:min-h-auto py-2.5 md:py-2',
                          schedule?.is_confirmed && !isAdmin
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer hover:opacity-80',
                          getCellClass(employee, day),
                          isDragging && dragEmployee?.id === employee.id && draggedDays.has(day) ? 'ring-2 ring-blue-500' : ''
                        ]"
                        :style="getCellStyle(employee, day)"
                      >
                        <span v-if="getLeaveType(employee, day) === 'personal'" class="text-yellow-900">事</span>
                        <span v-else-if="getLeaveType(employee, day) === 'sick'" class="text-purple-900">病</span>
                        <span v-else-if="getLeaveType(employee, day) === 'hourly'" class="text-blue-900">時</span>
                        <span v-else-if="getLeaveType(employee, day) === 'annual'" class="text-green-900">年</span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4" style="z-index: 9999 !important;">
      <div class="bg-white rounded-lg p-6 w-full max-w-md" @click.stop>
        <h2 class="text-xl font-bold mb-4">管理員登入</h2>
        <form @submit.prevent="login">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">帳號</label>
            <input
              v-model="loginForm.username"
              type="text"
              class="w-full border rounded px-3 py-2"
              required
            >
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">密碼</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="w-full border rounded px-3 py-2"
              required
            >
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              @click="showLoginModal = false"
              class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              登入
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddEmployeeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b-2 pb-3">新增員工</h2>
        <form @submit.prevent="addEmployee">
          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2 text-gray-700">員工姓名</label>
            <input
              v-model="newEmployeeForm.name"
              type="text"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="請輸入員工姓名"
              required
            >
          </div>

          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2 text-gray-700">所屬部門</label>
            <select
              v-model="newEmployeeForm.department_id"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              required
            >
              <option value="">請選擇部門</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold mb-3 text-gray-700">代表色</label>
            <div v-if="availableColors.length === 0" class="text-red-600 font-medium">
              ⚠️ 所有顏色已被使用，無法新增更多員工
            </div>
            <div v-else class="grid grid-cols-5 gap-3">
              <button
                v-for="color in availableColors"
                :key="color.hex"
                type="button"
                @click="newEmployeeForm.color = color.hex"
                :class="[
                  'flex flex-col items-center p-3 rounded-lg border-2 transition-all',
                  newEmployeeForm.color === color.hex
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                    : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                ]"
              >
                <div
                  class="w-10 h-10 rounded-full mb-2 shadow-md"
                  :style="{ backgroundColor: color.hex }"
                ></div>
                <span class="text-xs font-medium text-gray-700">{{ color.name }}</span>
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t-2">
            <button
              type="button"
              @click="closeAddEmployeeModal"
              class="px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!newEmployeeForm.color || availableColors.length === 0"
              class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              新增員工
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Department Modal -->
    <div v-if="showAddDepartmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b-2 pb-3">新增部門</h2>
        <form @submit.prevent="addDepartment">
          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2 text-gray-700">部門名稱</label>
            <input
              v-model="newDepartmentForm.name"
              type="text"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="請輸入部門名稱"
              required
            >
          </div>

          <div class="mb-6">
            <label class="block text-sm font-semibold mb-2 text-gray-700">排序順序</label>
            <input
              v-model.number="newDepartmentForm.sort_order"
              type="number"
              min="0"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="留空則自動排序到最後"
            >
            <p class="text-xs text-gray-500 mt-1">數字越小越靠前</p>
          </div>

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t-2">
            <button
              type="button"
              @click="closeAddDepartmentModal"
              class="px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all"
            >
              新增部門
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// State
const departments = ref([]);
const schedule = ref(null);
const selectedEmployee = ref(null);
const scheduleTable = ref(null); // 用於抓取表格 DOM 元素
const selectedYear = ref(114);
const selectedMonth = ref(11);
const isAdmin = ref(false);
const adminName = ref('');
const showLoginModal = ref(false);
const loginForm = ref({
  username: '',
  password: ''
});

// Management State
const showManagementMenu = ref(false);
const showAddEmployeeModal = ref(false);
const showAddDepartmentModal = ref(false);
const showMobileDepartmentManager = ref(false);
const availableColors = ref([]);
const newEmployeeForm = ref({
  name: '',
  department_id: '',
  color: ''
});
const newDepartmentForm = ref({
  name: '',
  sort_order: null
});

// Drag State
const isDragging = ref(false);
const dragStartDay = ref(null);
const dragEndDay = ref(null);
const dragEmployee = ref(null);
const draggedDays = ref(new Set());
const dragAction = ref(null); // 'add' or 'remove'
const justFinishedDrag = ref(false); // 標記是否剛完成拖曳操作

// Leave Type State
const leaveTypeMode = ref(null); // 'personal' or 'sick' or null

// Mouse event tracking
const mouseDownTime = ref(null);

let clearEmployeeTimer = null;

// Computed
const years = computed(() => {
  const currentYear = new Date().getFullYear() - 1911;
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
});

const daysInMonth = computed(() => {
  const westernYear = selectedYear.value + 1911;
  return new Date(westernYear, selectedMonth.value, 0).getDate();
});

// Methods
const getDayOfWeek = (day) => {
  const westernYear = selectedYear.value + 1911;
  const date = new Date(westernYear, selectedMonth.value - 1, day);
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return days[date.getDay()];
};

const selectEmployee = (employee) => {
  if (!selectedEmployee.value || selectedEmployee.value.id !== employee.id) {
    selectedEmployee.value = employee;

    // Log employee selection
    axios.post(`/api/employees/${employee.id}/select`, {
      schedule_id: schedule.value?.id
    });

    // Clear selection after 3 minutes
    if (clearEmployeeTimer) {
      clearTimeout(clearEmployeeTimer);
    }
    clearEmployeeTimer = setTimeout(() => {
      selectedEmployee.value = null;
    }, 3 * 60 * 1000);
  } else {
    selectedEmployee.value = null;
    if (clearEmployeeTimer) {
      clearTimeout(clearEmployeeTimer);
    }
  }
};

// Handle mobile employee select dropdown
const handleMobileEmployeeSelect = (event) => {
  const employeeId = parseInt(event.target.value);
  if (!employeeId) {
    selectedEmployee.value = null;
    if (clearEmployeeTimer) {
      clearTimeout(clearEmployeeTimer);
    }
    return;
  }

  // Find the employee by ID
  let foundEmployee = null;
  for (const dept of departments.value) {
    foundEmployee = dept.employees.find(emp => emp.id === employeeId);
    if (foundEmployee) break;
  }

  if (foundEmployee) {
    selectEmployee(foundEmployee);
  }
};

const isEmployeeDayOff = (employee, day) => {
  if (!employee.schedule_records) return false;
  const record = employee.schedule_records.find(r => r.day === day);
  return record?.is_off || false;
};

const getLeaveType = (employee, day) => {
  if (!employee.schedule_records) return null;
  const record = employee.schedule_records.find(r => r.day === day);
  return record?.leave_type || null;
};

const getCellClass = (employee, day) => {
  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日') return '';
  return '';
};

const getCellStyle = (employee, day) => {
  const dayOfWeek = getDayOfWeek(day);
  const isOff = isEmployeeDayOff(employee, day);

  if (dayOfWeek === '日') {
    return { backgroundColor: '#f7caab' }; // 週日顏色
  }

  if (isOff) {
    return { backgroundColor: '#FF0000' }; // 紅色休假
  }

  return {};
};

const toggleLeaveTypeMode = (type) => {
  // 如果班表已確認且操作者是訪客，則禁用所有操作
  if (schedule.value?.is_confirmed && !isAdmin.value) {
    alert('班表已確認，無法更改。');
    return;
  }

  // 點擊同一個按鈕則取消模式
  if (leaveTypeMode.value === type) {
    leaveTypeMode.value = null;
  } else {
    leaveTypeMode.value = type;
  }
};

const toggleDayOff = async (employee, day, event) => {
  // 如果班表已確認且操作者是訪客，則禁用所有操作
  if (schedule.value?.is_confirmed && !isAdmin.value) {
    alert('班表已確認，無法更改。');
    return;
  }

  // 如果剛完成拖曳操作，則忽略這次點擊（避免拖曳後觸發 click）
  if (justFinishedDrag.value) {
    justFinishedDrag.value = false;
    return;
  }

  if (!selectedEmployee.value) {
    alert('請先選擇員工');
    return;
  }

  if (selectedEmployee.value.id !== employee.id) {
    alert('請先選擇員工');
    return;
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日') {
    return; // 不能點選店休日
  }

  // 如果在假別模式，則標記假別
  if (leaveTypeMode.value) {
    await markLeaveType(employee, day, leaveTypeMode.value);
    return;
  }

  // 一般模式：切換休假狀態
  try {
    const response = await axios.post('/api/schedules/records', {
      schedule_id: schedule.value.id,
      employee_id: employee.id,
      day: day
    });

    // Update local state
    if (!employee.schedule_records) {
      employee.schedule_records = [];
    }

    const existingRecord = employee.schedule_records.find(r => r.day === day);
    if (existingRecord) {
      existingRecord.is_off = response.data.record.is_off;
      existingRecord.leave_type = response.data.record.leave_type;
    } else {
      employee.schedule_records.push(response.data.record);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message);
    } else {
      alert('操作失敗');
    }
  }
};

const markLeaveType = async (employee, day, type) => {
  try {
    const response = await axios.post('/api/schedules/records', {
      schedule_id: schedule.value.id,
      employee_id: employee.id,
      day: day,
      leave_type: type
    });

    // Update local state
    if (!employee.schedule_records) {
      employee.schedule_records = [];
    }

    const existingRecord = employee.schedule_records.find(r => r.day === day);
    if (existingRecord) {
      existingRecord.is_off = response.data.record.is_off;
      existingRecord.leave_type = response.data.record.leave_type;
    } else {
      employee.schedule_records.push(response.data.record);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message);
    } else {
      alert('標記假別失敗');
    }
  }
};

// Drag handlers
const handleMouseDown = (employee, day, event) => {
  // 如果班表已確認且操作者是訪客，則禁用所有操作
  if (schedule.value?.is_confirmed && !isAdmin.value) {
    alert('班表已確認，無法更改。');
    return;
  }

  // 記錄 mousedown 時間
  mouseDownTime.value = Date.now();

  // 假別模式下不啟用拖曳功能
  if (leaveTypeMode.value) {
    return;
  }

  if (!selectedEmployee.value || selectedEmployee.value.id !== employee.id) {
    return;
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日') {
    return; // 不能拖曳店休日
  }

  event.preventDefault();

  isDragging.value = true;
  dragStartDay.value = day;
  dragEndDay.value = day;
  dragEmployee.value = employee;
  draggedDays.value = new Set([day]);

  // 決定是新增還是移除休假（根據當前狀態的相反）
  const isCurrentlyOff = isEmployeeDayOff(employee, day);
  dragAction.value = isCurrentlyOff ? 'remove' : 'add';
};

const handleMouseEnter = (employee, day) => {
  if (!isDragging.value || dragEmployee.value?.id !== employee.id) {
    return;
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日') {
    return; // 跳過店休日
  }

  dragEndDay.value = day;

  // 計算拖曳範圍內的所有日期
  const startDay = Math.min(dragStartDay.value, dragEndDay.value);
  const endDay = Math.max(dragStartDay.value, dragEndDay.value);

  draggedDays.value.clear();
  for (let d = startDay; d <= endDay; d++) {
    const dow = getDayOfWeek(d);
    if (dow !== '日') { // 排除店休日
      draggedDays.value.add(d);
    }
  }
};

const handleMouseUp = async () => {
  if (!isDragging.value) {
    return;
  }

  try {
    // 批量更新所有拖曳的日期
    const promises = Array.from(draggedDays.value).map(async (day) => {
      const response = await axios.post('/api/schedules/records', {
        schedule_id: schedule.value.id,
        employee_id: dragEmployee.value.id,
        day: day,
        force_action: dragAction.value // 強制設定為新增或移除
      });

      // Update local state
      if (!dragEmployee.value.schedule_records) {
        dragEmployee.value.schedule_records = [];
      }

      const existingRecord = dragEmployee.value.schedule_records.find(r => r.day === day);
      if (existingRecord) {
        existingRecord.is_off = response.data.record.is_off;
      } else {
        dragEmployee.value.schedule_records.push(response.data.record);
      }

      return response;
    });

    await Promise.all(promises);
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message);
    } else {
      alert('批量操作失敗');
    }
  } finally {
    // 重置拖曳狀態
    isDragging.value = false;
    dragStartDay.value = null;
    dragEndDay.value = null;
    dragEmployee.value = null;
    draggedDays.value.clear();
    dragAction.value = null;

    // 設定旗標以阻擋拖曳完成後的click事件
    justFinishedDrag.value = true;
  }
};

const handleLoginClick = () => {
  showLoginModal.value = true;
};

const login = async () => {
  try {
    const response = await axios.post('/api/auth/login', loginForm.value);
    if (response.data.success) {
      isAdmin.value = true;
      adminName.value = response.data.admin.name;
      showLoginModal.value = false;
      loginForm.value = { username: '', password: '' };
    }
  } catch (error) {
    alert(error.response?.data?.message || '登入失敗');
  }
};

const logout = async () => {
  try {
    await axios.post('/api/auth/logout');
    isAdmin.value = false;
    adminName.value = '';
  } catch (error) {
    // 登出失敗時靜默處理
  }
};

const confirmSchedule = async () => {
  if (!confirm('確定要確認本月班表嗎？確認後非管理員將無法編輯。')) {
    return;
  }

  try {
    const response = await axios.post(`/api/schedules/${schedule.value.id}/confirm`);
    if (response.data.success) {
      alert('班表已確認');
      schedule.value.is_confirmed = true;
    }
  } catch (error) {
    alert(error.response?.data?.message || '確認失敗');
  }
};

const unconfirmSchedule = async () => {
  if (!confirm('確定要取消確認本月班表嗎？取消後所有員工將可以重新編輯。')) {
    return;
  }

  try {
    const response = await axios.post(`/api/schedules/${schedule.value.id}/unconfirm`);
    if (response.data.success) {
      alert('班表確認已取消');
      schedule.value.is_confirmed = false;
    }
  } catch (error) {
    alert(error.response?.data?.message || '取消確認失敗');
  }
};

const exportScheduleToPDF = async () => {
  try {
    console.log('=== 開始匯出 PDF ===');

    // 檢查表格是否存在
    if (!scheduleTable.value) {
      console.error('錯誤：找不到表格元素');
      alert('找不到表格元素，請重新整理頁面後再試');
      return;
    }
    console.log('✓ 表格元素已找到');

    // 顯示載入中的提示
    console.log('正在生成 PDF，請稍候...');

    // 取得表格的父容器（有 overflow-x-auto 的 div）
    const tableContainer = scheduleTable.value.parentElement;
    if (!tableContainer) {
      console.error('錯誤：找不到表格容器');
      alert('找不到表格容器');
      return;
    }
    console.log('✓ 表格容器已找到');

    const originalOverflow = tableContainer.style.overflow;
    const originalWidth = tableContainer.style.width;

    // 暫時移除橫向滾動限制，讓完整表格可見
    tableContainer.style.overflow = 'visible';
    tableContainer.style.width = 'auto';
    console.log('✓ 已調整表格樣式');

    // 使用 html2canvas 將表格轉換為圖片
    console.log('開始使用 html2canvas 截圖...');
    const canvas = await html2canvas(scheduleTable.value, {
      scale: 2, // 提高解析度
      useCORS: true, // 允許跨域圖片
      logging: false, // 關閉 console 日誌
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        // 在複製的文檔中移除所有 Tailwind CSS，只保留表格基本樣式
        const style = clonedDoc.createElement('style');
        style.textContent = `
          /* 移除所有可能使用 oklch 的樣式 */
          * {
            color: #000000 !important;
            background-color: transparent !important;
            border-color: #d1d5db !important;
          }

          /* 保留表格結構 */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            background-color: #ffffff !important;
          }

          th, td {
            border: 2px solid #d1d5db !important;
            padding: 8px !important;
            text-align: center !important;
          }

          th {
            background-color: #f3f4f6 !important;
            font-weight: bold !important;
          }

          /* 保留重要的表格顏色：週日 */
          th[style*="#f7caab"], td[style*="#f7caab"] {
            background-color: #f7caab !important;
          }

          /* 保留重要的表格顏色：休假紅色 */
          td[style*="#FF0000"], td[style*="rgb(255, 0, 0)"] {
            background-color: #FF0000 !important;
          }

          /* 保留假別標記顏色 */
          span {
            font-weight: bold !important;
          }
        `;
        clonedDoc.head.appendChild(style);

        // 找到表格並手動設置重要樣式
        const clonedTable = clonedDoc.querySelector('table');
        if (clonedTable) {
          // 遍歷所有單元格
          const allCells = clonedTable.querySelectorAll('td, th');
          allCells.forEach(cell => {
            const originalStyle = window.getComputedStyle(cell);

            // 檢查是否為休假日（紅色背景）
            if (originalStyle.backgroundColor === 'rgb(255, 0, 0)') {
              cell.style.backgroundColor = '#FF0000';
              cell.style.setProperty('background-color', '#FF0000', 'important');
            }
            // 檢查是否為週日（橘色背景）
            else if (originalStyle.backgroundColor.includes('247, 202, 171')) {
              cell.style.backgroundColor = '#f7caab';
              cell.style.setProperty('background-color', '#f7caab', 'important');
            }
            // 其他單元格使用白色或灰色
            else if (cell.tagName === 'TH') {
              cell.style.backgroundColor = '#f3f4f6';
            } else {
              cell.style.backgroundColor = '#ffffff';
            }

            // 設置文字顏色
            cell.style.color = '#000000';
            cell.style.borderColor = '#d1d5db';
          });
        }
      }
    });
    console.log('✓ 截圖完成，canvas 尺寸：', canvas.width, 'x', canvas.height);

    // 恢復原本的樣式
    tableContainer.style.overflow = originalOverflow;
    tableContainer.style.width = originalWidth;
    console.log('✓ 已恢復表格樣式');

    // 取得 canvas 尺寸
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // 建立 PDF（使用橫向模式以容納寬表格）
    console.log('開始建立 PDF...');
    const pdf = new jsPDF({
      orientation: 'landscape', // 橫向
      unit: 'mm',
      format: 'a4'
    });

    // 計算圖片在 PDF 中的尺寸（保持比例）
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgScaledWidth = imgWidth * ratio;
    const imgScaledHeight = imgHeight * ratio;
    console.log('✓ PDF 尺寸計算完成：', imgScaledWidth.toFixed(2), 'x', imgScaledHeight.toFixed(2), 'mm');

    // 將 canvas 轉換為圖片並添加到 PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgScaledWidth, imgScaledHeight);
    console.log('✓ 圖片已加入 PDF');

    // 產生檔名：班表_114年11月.pdf
    const fileName = `班表_${selectedYear.value}年${selectedMonth.value}月.pdf`;

    // 下載 PDF
    pdf.save(fileName);

    console.log('=== PDF 匯出成功！===');
    alert('PDF 匯出成功！');
  } catch (error) {
    console.error('=== 匯出 PDF 時發生錯誤 ===');
    console.error('錯誤類型：', error.name);
    console.error('錯誤訊息：', error.message);
    console.error('完整錯誤：', error);
    alert(`匯出 PDF 失敗：${error.message}\n\n請查看瀏覽器 Console 以獲得更多資訊`);
  }
};

const loadEmployees = async () => {
  try {
    const response = await axios.get('/api/employees');
    departments.value = response.data.departments;
  } catch (error) {
    // 載入員工失敗時靜默處理
  }
};

const loadSchedule = async () => {
  try {
    const response = await axios.get(`/api/schedules/${selectedYear.value}/${selectedMonth.value}`);
    schedule.value = response.data.schedule;

    // Merge schedule records into employees
    const employeeMap = {};
    Object.values(response.data.employees).forEach(deptEmployees => {
      deptEmployees.forEach(emp => {
        employeeMap[emp.id] = emp;
      });
    });

    departments.value.forEach(dept => {
      dept.employees.forEach(emp => {
        const fetchedEmp = employeeMap[emp.id];
        if (fetchedEmp) {
          emp.schedule_records = fetchedEmp.schedule_records || [];
        }
      });
    });
  } catch (error) {
    // 載入班表失敗時靜默處理
  }
};

const checkAuth = async () => {
  try {
    const response = await axios.get('/api/auth/check');
    if (response.data.isAuthenticated) {
      isAdmin.value = true;
      adminName.value = response.data.admin.name;
    }
  } catch (error) {
    // 檢查認證失敗時靜默處理
  }
};

// Management Methods
const openAddEmployeeModal = async () => {
  showManagementMenu.value = false;
  try {
    // 載入可用的員工代表色
    const response = await axios.get('/api/employees/available-colors');
    availableColors.value = response.data.colors;
    
    // 重置表單
    newEmployeeForm.value = {
      name: '',
      department_id: '',
      color: ''
    };
    
    showAddEmployeeModal.value = true;
  } catch (error) {
    alert('載入可用顏色失敗');
  }
};

const closeAddEmployeeModal = () => {
  showAddEmployeeModal.value = false;
  newEmployeeForm.value = {
    name: '',
    department_id: '',
    color: ''
  };
  availableColors.value = [];
};

const addEmployee = async () => {
  try {
    const response = await axios.post('/api/employees', newEmployeeForm.value);
    
    if (response.data.success) {
      alert('員工新增成功！');
      closeAddEmployeeModal();
      
      // 重新載入員工列表
      await loadEmployees();
      await loadSchedule();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert('驗證錯誤：\n' + errors.join('\n'));
    } else {
      alert('新增員工失敗');
    }
  }
};

const openAddDepartmentModal = () => {
  showManagementMenu.value = false;
  newDepartmentForm.value = {
    name: '',
    sort_order: null
  };
  showAddDepartmentModal.value = true;
};

const closeAddDepartmentModal = () => {
  showAddDepartmentModal.value = false;
  newDepartmentForm.value = {
    name: '',
    sort_order: null
  };
};

const addDepartment = async () => {
  try {
    const payload = { name: newDepartmentForm.value.name };
    if (newDepartmentForm.value.sort_order !== null && newDepartmentForm.value.sort_order !== '') {
      payload.sort_order = newDepartmentForm.value.sort_order;
    }
    
    const response = await axios.post('/api/departments', payload);
    
    if (response.data.success) {
      alert('部門新增成功！');
      closeAddDepartmentModal();
      
      // 重新載入員工列表（包含部門資訊）
      await loadEmployees();
      await loadSchedule();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert('驗證錯誤：\n' + errors.join('\n'));
    } else {
      alert('新增部門失敗');
    }
  }
};

const deleteEmployee = async (employee) => {
  if (!confirm(`確定要刪除員工「${employee.name}」嗎？\n\n刪除後該員工將不再顯示於列表中，但歷史班表記錄仍會保留。`)) {
    return;
  }

  try {
    const response = await axios.delete(`/api/employees/${employee.id}`);

    if (response.data.success) {
      alert('員工已刪除！');

      // 如果刪除的是當前選中的員工，清除選擇
      if (selectedEmployee.value?.id === employee.id) {
        selectedEmployee.value = null;
      }

      // 重新載入員工列表
      await loadEmployees();
      await loadSchedule();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('刪除員工失敗');
    }
  }
};

const deleteDepartment = async (department) => {
  if (!confirm(`確定要刪除部門「${department.name}」嗎？\n\n注意：部門下如有員工則無法刪除。`)) {
    return;
  }

  try {
    const response = await axios.delete(`/api/departments/${department.id}`);

    if (response.data.success) {
      alert('部門已刪除！');

      // 重新載入員工列表
      await loadEmployees();
      await loadSchedule();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('刪除部門失敗');
    }
  }
};

// Close management menu when clicking outside
const handleClickOutside = (event) => {
  if (showManagementMenu.value && !event.target.closest('.management-dropdown')) {
    showManagementMenu.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  await checkAuth();
  await loadEmployees();
  await loadSchedule();

  // Add click listener to close management menu when clicking outside
  document.addEventListener('click', handleClickOutside);

  // Add global mouseup listener for drag operations
  document.addEventListener('mouseup', handleMouseUp);
});

onUnmounted(() => {
  if (clearEmployeeTimer) {
    clearTimeout(clearEmployeeTimer);
  }
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<style scoped>
table {
  border-collapse: collapse;
}

.sticky {
  position: sticky;
}

/* Fix for modal positioning */
.fixed.inset-0 {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
}
</style>
