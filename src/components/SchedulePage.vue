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
                  <button
                    @click="openAddLeaveTypeModal"
                    class="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 font-medium transition-colors"
                  >
                    ➕ 新增假別
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
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-800">選擇員工</h2>
              <button
                @click="toggleMultiSelectMode"
                :class="[
                  'px-3 py-1.5 text-xs rounded-lg font-medium transition-all border',
                  isMultiSelectMode
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                ]"
              >
                多選
              </button>
            </div>
            <!-- 全選所有 -->
            <label v-if="isMultiSelectMode" class="flex items-center gap-2 mt-3 px-2 py-1.5 bg-blue-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                :checked="isAllChecked"
                @change="toggleCheckAll"
                class="w-4 h-4 rounded text-blue-600"
              />
              <span class="text-sm font-medium text-blue-700">全選所有</span>
              <span class="text-xs text-blue-500">({{ selectedEmployees.size }})</span>
            </label>
          </div>

          <!-- Scrollable Content Section -->
          <div class="flex-1 overflow-y-auto p-4 lg:p-6">
            <div v-for="(dept, index) in departments" :key="dept.id" :class="index > 0 ? 'mt-6 pt-6 border-t-2 border-gray-100' : ''">
              <div class="flex items-center justify-between mb-3">
                <!-- 部門全選 checkbox -->
                <label v-if="isMultiSelectMode" class="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="isDepartmentAllChecked(dept)"
                    @change="toggleDepartmentCheckAll(dept)"
                    class="w-4 h-4 rounded text-blue-600"
                  />
                  <h3 class="font-bold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg text-sm uppercase tracking-wide flex-1">{{ dept.name }}</h3>
                </label>
                <h3 v-else class="font-bold text-gray-700 px-3 py-2 bg-gray-100 rounded-lg text-sm uppercase tracking-wide flex-1">{{ dept.name }}</h3>
                <button
                  v-if="isAdmin && !isMultiSelectMode"
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
                  <!-- 多選模式：checkbox -->
                  <label
                    v-if="isMultiSelectMode"
                    class="flex items-center gap-0 flex-1 cursor-pointer"
                    :class="{ 'opacity-50 cursor-not-allowed': employee.is_active === false }"
                  >
                    <input
                      type="checkbox"
                      :checked="selectedEmployees.has(employee.id)"
                      :disabled="employee.is_active === false"
                      @change="toggleEmployeeCheck(employee.id)"
                      class="w-4 h-4 rounded text-blue-600 mr-2 flex-shrink-0"
                    />
                    <span
                      :class="[
                        'flex-1 px-4 py-3 rounded-lg text-left transition-all font-medium',
                        selectedEmployees.has(employee.id)
                          ? 'ring-2 ring-offset-1 ring-blue-400 bg-blue-50'
                          : 'hover:bg-gray-50 hover:shadow-sm'
                      ]"
                      :style="{ borderLeft: `5px solid ${employee.color}` }"
                    >
                      <span class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: employee.color }"></span>
                        {{ employee.name }}
                      </span>
                    </span>
                  </label>
                  <!-- 單選模式：原有按鈕 -->
                  <button
                    v-else
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
                    v-if="isAdmin && !isMultiSelectMode"
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
        <div v-if="selectedEmployee || isMultiSelectMode" class="w-full md:flex-1 bg-white rounded-xl shadow-xl border-2 border-gray-200 overflow-hidden">
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
                <div class="flex items-center gap-2 md:ml-4 pt-3 md:pt-0 border-t-2 md:border-t-0 md:border-l-2 border-blue-200 md:pl-4 flex-wrap">
                  <label class="font-semibold text-gray-700 text-sm md:text-base">假別標記：</label>

                  <!-- Built-in Leave Types -->
                  <button
                    @click="toggleLeaveTypeMode('personal')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="getLeaveTypeButtonClass('personal', 'yellow')"
                  >
                    事
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('sick')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="getLeaveTypeButtonClass('sick', 'purple')"
                  >
                    病
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('hourly')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="getLeaveTypeButtonClass('hourly', 'blue')"
                  >
                    時
                  </button>
                  <button
                    @click="toggleLeaveTypeMode('annual')"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="getLeaveTypeButtonClass('annual', 'green')"
                  >
                    年
                  </button>

                  <!-- Custom Leave Types (Dynamic) -->
                  <button
                    v-for="customType in customLeaveTypes"
                    :key="customType.id"
                    @click="toggleLeaveTypeMode(customType.code)"
                    :disabled="schedule?.is_confirmed && !isAdmin"
                    :class="getLeaveTypeButtonClass(customType.code, 'orange')"
                  >
                    {{ customType.name }}
                  </button>

                  <!-- Delete Button (when custom leave type is selected) -->
                  <button
                    v-if="isAdmin && leaveTypeMode && leaveTypeMode.startsWith('custom_')"
                    @click="deleteCustomLeaveType"
                    class="px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:border-red-400"
                    title="刪除此假別"
                  >
                    🗑️
                  </button>
                </div>

                <!-- Confirmed Badge -->
                <span v-if="schedule?.is_confirmed" class="md:ml-auto px-3 py-2 bg-green-100 text-green-800 rounded-lg font-semibold border-2 border-green-200 text-sm md:text-base text-center">
                  ✓ 已確認
                </span>
              </div>
            </div>

            <!-- Schedule Grid -->
            <div class="overflow-x-auto overflow-y-auto max-h-[calc(100vh-16rem)] -mx-4 md:mx-0 px-4 md:px-0">
              <table ref="scheduleTable" class="border-collapse border-2 border-gray-300 text-sm w-full">
                <thead>
                  <!-- Row 1: Year.Month and Days -->
                  <tr class="sticky-header-row-1">
                    <th class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-3 bg-gray-100 sticky left-0 z-10 min-w-[100px] md:min-w-[150px] font-bold text-sm md:text-base">
                      {{ selectedYear }}.{{ selectedMonth }}
                    </th>
                    <th
                      v-for="day in daysInMonth"
                      :key="`day-${day}`"
                      :class="[
                        'border border-gray-300 px-2 md:px-3 py-2 min-w-[36px] md:min-w-[40px] font-semibold text-xs md:text-sm',
                        getDayOfWeek(day) === '日' ? '' : 'bg-gray-50',
                        isAdmin && getDayOfWeek(day) !== '日' ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''
                      ]"
                      :style="getHeaderStyle(day)"
                      @click="isAdmin && getDayOfWeek(day) !== '日' ? toggleHolidayColumn(day) : null"
                      :title="isAdmin && getDayOfWeek(day) !== '日' ? '點擊標記為公休日' : ''"
                    >
                      {{ day }}
                      <span v-if="holidays.has(day)" class="ml-1 text-xs">🏖️</span>
                    </th>
                  </tr>
                  <!-- Row 2: Day of Week -->
                  <tr class="sticky-header-row-2">
                    <th class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-3 bg-gray-100 sticky left-0 z-10 font-bold"></th>
                    <th
                      v-for="day in daysInMonth"
                      :key="`dow-${day}`"
                      :class="[
                        'border border-gray-300 px-2 md:px-3 py-2 font-semibold text-xs md:text-sm',
                        getDayOfWeek(day) === '日' ? '' : 'bg-gray-50',
                        isAdmin && getDayOfWeek(day) !== '日' ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''
                      ]"
                      :style="getHeaderStyle(day)"
                      @click="isAdmin && getDayOfWeek(day) !== '日' ? toggleHolidayColumn(day) : null"
                      :title="isAdmin && getDayOfWeek(day) !== '日' ? '點擊標記為公休日' : ''"
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
                        backgroundColor: isMultiSelectMode && selectedEmployees.has(employee.id)
                          ? '#EFF6FF'
                          : selectedEmployee?.id === employee.id ? employee.color + '20' : 'white',
                        borderLeft: isMultiSelectMode && selectedEmployees.has(employee.id)
                          ? '4px solid #3B82F6'
                          : selectedEmployee?.id === employee.id ? `4px solid ${employee.color}` : '2px solid #d1d5db'
                      }"
                    >
                      <td
                        class="border-2 border-gray-300 px-2 md:px-4 py-2 md:py-2.5 sticky left-0 z-10 font-medium min-w-[100px] md:min-w-[150px]"
                        :style="{
                          backgroundColor: isMultiSelectMode && selectedEmployees.has(employee.id)
                            ? '#EFF6FF'
                            : selectedEmployee?.id === employee.id ? employee.color + '20' : 'white'
                        }"
                      >
                        <span class="flex items-center gap-1 md:gap-2">
                          <span
                            class="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                            :style="{ backgroundColor: employee.color }"
                            :class="{ 'opacity-40': employee.is_active === false }"
                          ></span>
                          <span
                            class="text-xs md:text-sm"
                            :class="{ 'text-gray-400': employee.is_active === false }"
                          >{{ employee.name }}</span>
                          <span
                            v-if="employee.is_active === false"
                            class="inline-block text-[9px] bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded font-semibold"
                          >已離職</span>
                        </span>
                      </td>
                      <td
                        v-for="day in daysInMonth"
                        :key="`emp-${employee.id}-${day}`"
                        @mousedown="employee.is_active !== false && handleMouseDown(employee, day, $event)"
                        @mouseenter="employee.is_active !== false && handleMouseEnter(employee, day)"
                        @click.prevent="employee.is_active !== false && toggleDayOff(employee, day)"
                        :class="[
                          'border border-gray-300 transition-opacity select-none text-center font-bold text-base md:text-lg min-h-[44px] md:min-h-auto py-2.5 md:py-2',
                          employee.is_active === false
                            ? 'cursor-not-allowed'
                            : schedule?.is_confirmed && !isAdmin
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer hover:opacity-80',
                          getCellClass(employee, day),
                          isDragging && draggedDays.has(day) && (isMultiSelectMode ? selectedEmployees.has(employee.id) : dragEmployee?.id === employee.id) ? `ring-2 ${dragRingClass}` : ''
                        ]"
                        :style="getCellStyle(employee, day)"
                      >
                        <span v-if="getLeaveType(employee, day) === 'personal'" :class="employee.is_active === false ? 'text-yellow-900/50' : 'text-yellow-900'">事</span>
                        <span v-else-if="getLeaveType(employee, day) === 'sick'" :class="employee.is_active === false ? 'text-purple-900/50' : 'text-purple-900'">病</span>
                        <span v-else-if="getLeaveType(employee, day) === 'hourly'" :class="employee.is_active === false ? 'text-blue-900/50' : 'text-blue-900'">時</span>
                        <span v-else-if="getLeaveType(employee, day) === 'annual'" :class="employee.is_active === false ? 'text-green-900/50' : 'text-green-900'">年</span>
                        <span v-else-if="getLeaveType(employee, day)?.startsWith('custom_')" :class="employee.is_active === false ? 'text-orange-900/50' : 'text-orange-900'">
                          {{ getCustomLeaveTypeName(getLeaveType(employee, day)) }}
                        </span>
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

    <!-- Add Custom Leave Type Modal -->
    <div v-if="showAddLeaveTypeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 border-b-2 pb-3">新增自訂假別</h2>
        <form @submit.prevent="addCustomLeaveType">
          <!-- 假別名稱輸入 -->
          <div class="mb-5">
            <label class="block text-sm font-semibold mb-2 text-gray-700">假別名稱（單一中文字）</label>
            <input
              v-model="newLeaveTypeForm.name"
              type="text"
              class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-center text-2xl font-bold"
              placeholder="例：婚"
              maxlength="1"
              pattern="[\u4e00-\u9fa5]"
              required
            >
            <p class="text-xs text-gray-500 mt-2">僅限輸入一個中文字，將以橘色顯示</p>
          </div>

          <!-- 顏色說明 -->
          <div class="mb-5 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p class="text-sm text-gray-700">
              <span class="font-semibold">顏色：</span>
              <span class="inline-flex items-center gap-2">
                <span class="w-6 h-6 rounded-full border-2 border-gray-300" :style="{ backgroundColor: customLeaveTypeColor }"></span>
                橘色 (Orange-500)
              </span>
            </p>
            <p class="text-xs text-gray-500 mt-1">所有自定義假別統一使用橘色</p>
          </div>

          <!-- 數量限制說明 -->
          <div class="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p class="text-xs text-gray-600">
              <span class="font-semibold">限制：</span>最多可新增 5 個自定義假別<br>
              <span class="font-semibold">目前：</span>已新增 {{ customLeaveTypes.length }} / 5 個
            </p>
          </div>

          <!-- 按鈕 -->
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t-2">
            <button
              type="button"
              @click="closeAddLeaveTypeModal"
              class="px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium transition-all"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!canAddMoreLeaveTypes"
              class="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              新增假別
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

// 根據台灣時間自動設定當前年月
const getTaiwanDateTime = () => {
  // 使用 Intl.DateTimeFormat 取得台灣時區的日期時間
  const taiwanTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Taipei' });
  const date = new Date(taiwanTime);

  return {
    year: date.getFullYear() - 1911, // 轉換為民國年
    month: date.getMonth() + 1 // 月份從 0 開始，需要 +1
  };
};

const { year: currentYear, month: currentMonth } = getTaiwanDateTime();
const selectedYear = ref(currentYear);
const selectedMonth = ref(currentMonth);
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

// 拖曳預覽環色彩（根據假別模式）
const dragRingClass = computed(() => {
  if (!leaveTypeMode.value) return 'ring-blue-500';
  const colorMap = {
    personal: 'ring-yellow-500',
    sick: 'ring-purple-500',
    hourly: 'ring-blue-500',
    annual: 'ring-green-500',
  };
  return colorMap[leaveTypeMode.value] || 'ring-orange-500'; // custom types → orange
});

// Multi-Select Employee State
const isMultiSelectMode = ref(false);
const selectedEmployees = ref(new Set());
let multiSelectTimer = null;

// Custom Leave Types State
const customLeaveTypes = ref([]); // { id, code, name, sort_order }[]
const customLeaveTypeColor = ref('#F97316'); // Orange-500
const canAddMoreLeaveTypes = ref(true);
const showAddLeaveTypeModal = ref(false);
const newLeaveTypeForm = ref({ name: '' });

// Holiday State
const holidays = ref(new Set()); // 儲存標記為公休日的日期集合 (Set<number>)

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

// Multi-select mode functions
const resetMultiSelectTimer = () => {
  if (multiSelectTimer) clearTimeout(multiSelectTimer);
  multiSelectTimer = setTimeout(() => {
    isMultiSelectMode.value = false;
    selectedEmployees.value.clear();
  }, 3 * 60 * 1000);
};

const toggleMultiSelectMode = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value;
  if (isMultiSelectMode.value) {
    // 進入多選：清除單選
    selectedEmployee.value = null;
    if (clearEmployeeTimer) clearTimeout(clearEmployeeTimer);
    resetMultiSelectTimer();
  } else {
    // 退出多選：清除勾選
    selectedEmployees.value.clear();
    if (multiSelectTimer) clearTimeout(multiSelectTimer);
  }
};

const toggleEmployeeCheck = (employeeId) => {
  if (selectedEmployees.value.has(employeeId)) {
    selectedEmployees.value.delete(employeeId);
  } else {
    selectedEmployees.value.add(employeeId);
  }
  resetMultiSelectTimer();
};

const toggleDepartmentCheckAll = (dept) => {
  const activeEmployees = dept.employees.filter(e => e.is_active !== false);
  const allChecked = activeEmployees.every(e => selectedEmployees.value.has(e.id));
  if (allChecked) {
    activeEmployees.forEach(e => selectedEmployees.value.delete(e.id));
  } else {
    activeEmployees.forEach(e => selectedEmployees.value.add(e.id));
  }
  resetMultiSelectTimer();
};

const toggleCheckAll = () => {
  const allActiveEmployees = departments.value.flatMap(d => d.employees.filter(e => e.is_active !== false));
  const allChecked = allActiveEmployees.every(e => selectedEmployees.value.has(e.id));
  if (allChecked) {
    selectedEmployees.value.clear();
  } else {
    allActiveEmployees.forEach(e => selectedEmployees.value.add(e.id));
  }
  resetMultiSelectTimer();
};

const isDepartmentAllChecked = (dept) => {
  const activeEmployees = dept.employees.filter(e => e.is_active !== false);
  return activeEmployees.length > 0 && activeEmployees.every(e => selectedEmployees.value.has(e.id));
};

const isAllChecked = computed(() => {
  const allActiveEmployees = departments.value.flatMap(d => d.employees.filter(e => e.is_active !== false));
  return allActiveEmployees.length > 0 && allActiveEmployees.every(e => selectedEmployees.value.has(e.id));
});

// Helper: check if employee is operable (selected in either mode)
const isEmployeeOperable = (employee) => {
  if (isMultiSelectMode.value) {
    return selectedEmployees.value.has(employee.id);
  }
  return selectedEmployee.value?.id === employee.id;
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

const getHeaderStyle = (day) => {
  const dayOfWeek = getDayOfWeek(day);

  // 週日：原本的橘色
  if (dayOfWeek === '日') {
    return { backgroundColor: '#f7caab' };
  }

  // 自定義公休日：同樣的橘色
  if (holidays.value.has(day)) {
    return { backgroundColor: '#f7caab' };
  }

  // 一般日期
  return {};
};

const getCellStyle = (employee, day) => {
  const dayOfWeek = getDayOfWeek(day);
  const isOff = isEmployeeDayOff(employee, day);
  const isInactive = employee.is_active === false;

  // 週日或公休日：橘色背景
  if (dayOfWeek === '日' || holidays.value.has(day)) {
    return { backgroundColor: '#f7caab' };
  }

  // 員工休假
  if (isOff) {
    // 離職員工：淡灰色背景（淡化）
    if (isInactive) {
      return { backgroundColor: '#e2e8f0' };
    }
    // 在職員工：紅色背景
    return { backgroundColor: '#FF0000' };
  }

  return {};
};

/**
 * 取得假別按鈕的 CSS class（簡化樣式管理）
 */
const getLeaveTypeButtonClass = (type, color) => {
  const baseClass = 'px-3 py-2 rounded-lg font-medium transition-all border-2 text-sm md:text-base';
  const disabled = schedule.value?.is_confirmed && !isAdmin.value;
  const isActive = leaveTypeMode.value === type;

  if (disabled) {
    return `${baseClass} bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed`;
  }

  const colorMap = {
    yellow: { active: 'bg-yellow-500 text-white border-yellow-600 shadow-md', inactive: 'bg-white text-gray-700 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50' },
    purple: { active: 'bg-purple-500 text-white border-purple-600 shadow-md', inactive: 'bg-white text-gray-700 border-gray-300 hover:border-purple-400 hover:bg-purple-50' },
    blue: { active: 'bg-blue-500 text-white border-blue-600 shadow-md', inactive: 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50' },
    green: { active: 'bg-green-500 text-white border-green-600 shadow-md', inactive: 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50' },
    orange: { active: 'bg-orange-500 text-white border-orange-600 shadow-md', inactive: 'bg-white text-gray-700 border-gray-300 hover:border-orange-400 hover:bg-orange-50' },
  };

  return `${baseClass} ${isActive ? colorMap[color].active : colorMap[color].inactive}`;
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

// Helper: 根據 ID 找到員工物件
const findEmployeeById = (id) => {
  for (const dept of departments.value) {
    const emp = dept.employees.find(e => e.id === id);
    if (emp) return emp;
  }
  return null;
};

// Helper: 取得當前操作的目標員工列表
const getTargetEmployees = (triggerEmployee) => {
  if (isMultiSelectMode.value) {
    return Array.from(selectedEmployees.value).map(id => findEmployeeById(id)).filter(Boolean);
  }
  return [triggerEmployee];
};

// Helper: 對單一員工的單一天送出 API 並更新 local state
const updateEmployeeDay = async (emp, day, extraPayload = {}) => {
  const response = await axios.post('/api/schedules/records', {
    schedule_id: schedule.value.id,
    employee_id: emp.id,
    day: day,
    ...extraPayload,
  });

  if (!emp.schedule_records) {
    emp.schedule_records = [];
  }
  const existingRecord = emp.schedule_records.find(r => r.day === day);
  if (existingRecord) {
    existingRecord.is_off = response.data.record.is_off;
    existingRecord.leave_type = response.data.record.leave_type;
  } else {
    emp.schedule_records.push(response.data.record);
  }
  return response;
};

// Helper: 批次 API — 一次送出多員工 × 多天，並更新 local state
const batchUpdateEmployeeDays = async (employeeIds, days, extraPayload = {}) => {
  const response = await axios.post('/api/schedules/batch-records', {
    schedule_id: schedule.value.id,
    employee_ids: employeeIds,
    days: days,
    ...extraPayload,
  });

  // 用回傳的 records 更新 local state
  if (response.data.records) {
    for (const record of response.data.records) {
      const emp = findEmployeeById(record.employee_id);
      if (!emp) continue;
      if (!emp.schedule_records) emp.schedule_records = [];
      const existing = emp.schedule_records.find(r => r.day === record.day);
      if (existing) {
        existing.is_off = record.is_off;
        existing.leave_type = record.leave_type;
      } else {
        emp.schedule_records.push(record);
      }
    }
  }

  return response;
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

  // 多選模式：檢查觸發員工是否在已勾選列表中
  if (isMultiSelectMode.value) {
    if (!selectedEmployees.value.has(employee.id)) return;
  } else {
    if (!selectedEmployee.value) {
      alert('請先選擇員工');
      return;
    }
    if (selectedEmployee.value.id !== employee.id) {
      alert('請先選擇員工');
      return;
    }
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日' || holidays.value.has(day)) {
    return; // 不能點選店休日或公休日
  }

  try {
    if (isMultiSelectMode.value && selectedEmployees.value.size > 1) {
      // 多選模式：使用批次 API
      const employeeIds = Array.from(selectedEmployees.value);
      const extraPayload = {};
      if (leaveTypeMode.value) {
        extraPayload.leave_type = leaveTypeMode.value;
      }
      await batchUpdateEmployeeDays(employeeIds, [day], extraPayload);
    } else {
      // 單選模式或僅一位員工：用原有邏輯
      const targets = getTargetEmployees(employee);
      if (leaveTypeMode.value) {
        await Promise.all(targets.map(emp => updateEmployeeDay(emp, day, { leave_type: leaveTypeMode.value })));
      } else {
        await Promise.all(targets.map(emp => updateEmployeeDay(emp, day)));
      }
    }
    if (isMultiSelectMode.value) resetMultiSelectTimer();
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message);
    } else {
      alert('操作失敗');
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

  // 多選模式：只允許在已勾選的員工行上拖曳
  if (isMultiSelectMode.value) {
    if (!selectedEmployees.value.has(employee.id)) return;
  } else {
    if (!selectedEmployee.value || selectedEmployee.value.id !== employee.id) return;
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日' || holidays.value.has(day)) {
    return; // 不能拖曳店休日或公休日
  }

  event.preventDefault();

  isDragging.value = true;
  dragStartDay.value = day;
  dragEndDay.value = day;
  dragEmployee.value = employee;
  draggedDays.value = new Set([day]);

  // 決定是新增還是移除（根據起始格狀態）
  if (leaveTypeMode.value) {
    // 假別模式：起始格已有相同假別 → 移除，否則 → 新增
    const currentLeaveType = getLeaveType(employee, day);
    dragAction.value = (isEmployeeDayOff(employee, day) && currentLeaveType === leaveTypeMode.value) ? 'remove' : 'add';
  } else {
    // 一般模式：起始格已休假 → 移除，否則 → 新增
    const isCurrentlyOff = isEmployeeDayOff(employee, day);
    dragAction.value = isCurrentlyOff ? 'remove' : 'add';
  }
};

const handleMouseEnter = (employee, day) => {
  if (employee.is_active === false) return;
  if (!isDragging.value) return;
  // 多選模式：允許在任何已勾選的員工行上移動
  if (isMultiSelectMode.value) {
    if (!selectedEmployees.value.has(employee.id)) return;
  } else {
    if (dragEmployee.value?.id !== employee.id) return;
  }

  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日' || holidays.value.has(day)) {
    return; // 跳過店休日或公休日
  }

  dragEndDay.value = day;

  // 計算拖曳範圍內的所有日期
  const startDay = Math.min(dragStartDay.value, dragEndDay.value);
  const endDay = Math.max(dragStartDay.value, dragEndDay.value);

  draggedDays.value.clear();
  for (let d = startDay; d <= endDay; d++) {
    const dow = getDayOfWeek(d);
    if (dow !== '日' && !holidays.value.has(d)) { // 排除店休日和公休日
      draggedDays.value.add(d);
    }
  }
};

const handleMouseUp = async () => {
  if (!isDragging.value) {
    return;
  }

  try {
    const targets = getTargetEmployees(dragEmployee.value);
    const days = Array.from(draggedDays.value);

    const extraPayload = { force_action: dragAction.value };
    if (leaveTypeMode.value && dragAction.value === 'add') {
      extraPayload.leave_type = leaveTypeMode.value;
    }

    if (targets.length > 1 || days.length > 1) {
      // 多員工或多天：使用批次 API（一個請求搞定）
      const employeeIds = targets.map(emp => emp.id);
      await batchUpdateEmployeeDays(employeeIds, days, extraPayload);
    } else if (targets.length === 1 && days.length === 1) {
      // 只有 1 員工 × 1 天：用原有單筆 API
      await updateEmployeeDay(targets[0], days[0], extraPayload);
    }

    if (isMultiSelectMode.value) resetMultiSelectTimer();
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

const toggleHolidayColumn = async (day) => {
  // 權限檢查
  if (!isAdmin.value) {
    alert('需要管理員權限才能標記公休日');
    return;
  }

  // 檢查是否為週日
  const dayOfWeek = getDayOfWeek(day);
  if (dayOfWeek === '日') {
    alert('週日已預設為公休日，無需額外標記');
    return;
  }

  // 確認對話框
  const isCurrentlyHoliday = holidays.value.has(day);
  const action = isCurrentlyHoliday ? '取消' : '標記';
  const dateStr = `${selectedYear.value}年${selectedMonth.value}月${day}日（${dayOfWeek}）`;

  if (!confirm(`確定要${action}「${dateStr}」為公休日嗎？\n\n${action === '標記' ? '標記後整欄將顯示公休日背景色' : '取消後將恢復正常上班日背景色'}`)) {
    return;
  }

  try {
    const response = await axios.post('/api/schedules/holidays', {
      schedule_id: schedule.value.id,
      day: day,
      name: null
    });

    if (response.data.success) {
      // 更新本地狀態
      if (response.data.action === 'added') {
        holidays.value.add(day);
      } else if (response.data.action === 'removed') {
        holidays.value.delete(day);
      }

      alert(response.data.message);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      alert(error.response.data.message || '權限不足');
    } else if (error.response?.status === 400) {
      alert(error.response.data.message);
    } else {
      alert('操作失敗，請稍後再試');
    }
    console.error('Toggle holiday error:', error);
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
          // 找到原始表格以便比對
          const originalTable = scheduleTable.value;

          // 遍歷所有行
          const allRows = clonedTable.querySelectorAll('tr');
          allRows.forEach((row, rowIndex) => {
            // 取得原始行
            const originalRow = originalTable.querySelectorAll('tr')[rowIndex];
            if (!originalRow) return;

            // 檢查是否為部門列（部門列通常第一個 td 有特定樣式）
            const firstCell = originalRow.querySelector('td');
            const originalFirstCellStyle = firstCell ? window.getComputedStyle(firstCell) : null;
            const isDepartmentRow = originalFirstCellStyle &&
                                   originalFirstCellStyle.backgroundColor === 'rgb(247, 202, 171)';

            // 遍歷該行的所有單元格
            const cells = row.querySelectorAll('td, th');
            cells.forEach((cell, cellIndex) => {
              // 取得原始單元格的樣式
              const originalCell = originalRow.querySelectorAll('td, th')[cellIndex];
              const originalStyle = originalCell ? window.getComputedStyle(originalCell) : null;

              // 優先級 1: 休假日（紅色背景）
              if (originalStyle && originalStyle.backgroundColor === 'rgb(255, 0, 0)') {
                cell.style.backgroundColor = '#FF0000';
                cell.style.setProperty('background-color', '#FF0000', 'important');
              }
              // 優先級 2: 部門列或週日欄（橘色背景）
              else if (isDepartmentRow ||
                      (originalStyle && originalStyle.backgroundColor === 'rgb(247, 202, 171)')) {
                cell.style.backgroundColor = '#f7caab';
                cell.style.setProperty('background-color', '#f7caab', 'important');
              }
              // 優先級 3: 其他單元格
              else if (cell.tagName === 'TH') {
                cell.style.backgroundColor = '#f3f4f6';
              } else {
                cell.style.backgroundColor = '#ffffff';
              }

              // 設置文字顏色
              cell.style.color = '#000000';
              cell.style.borderColor = '#d1d5db';
            });
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

    // 載入公休日
    if (response.data.holidays && Array.isArray(response.data.holidays)) {
      holidays.value = new Set(response.data.holidays);
    } else {
      holidays.value = new Set();
    }

    // Merge schedule records into employees（含離職員工）
    const employeeMap = {};
    Object.values(response.data.employees).forEach(deptEmployees => {
      deptEmployees.forEach(emp => {
        employeeMap[emp.id] = emp;
      });
    });

    // 先移除之前注入的離職員工（避免切換月份時殘留）
    departments.value.forEach(dept => {
      dept.employees = dept.employees.filter(emp => emp.is_active !== false);
    });

    departments.value.forEach(dept => {
      // 合併在職員工的班表紀錄
      dept.employees.forEach(emp => {
        const fetchedEmp = employeeMap[emp.id];
        if (fetchedEmp) {
          emp.schedule_records = fetchedEmp.schedule_records || [];
        } else {
          emp.schedule_records = [];
        }
      });

      // 注入該部門的離職員工（排在末尾）
      Object.values(response.data.employees).forEach(deptEmployees => {
        deptEmployees.forEach(emp => {
          if (emp.is_active === false && emp.department_id === dept.id) {
            // 避免重複加入
            if (!dept.employees.find(e => e.id === emp.id)) {
              dept.employees.push(emp);
            }
          }
        });
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

/**
 * 載入自訂假別列表
 */
const loadCustomLeaveTypes = async () => {
  try {
    const response = await axios.get('/api/leave-types');
    if (response.data.success) {
      customLeaveTypes.value = response.data.leave_types;
      customLeaveTypeColor.value = response.data.color;
      canAddMoreLeaveTypes.value = response.data.can_add_more;
    }
  } catch (error) {
    console.error('載入自定義假別失敗:', error);
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

/**
 * 開啟新增假別 Modal
 */
const openAddLeaveTypeModal = () => {
  showManagementMenu.value = false;

  if (!canAddMoreLeaveTypes.value) {
    alert('已達到自定義假別上限（5個），無法新增更多。');
    return;
  }

  newLeaveTypeForm.value = { name: '' };
  showAddLeaveTypeModal.value = true;
};

/**
 * 關閉新增假別 Modal
 */
const closeAddLeaveTypeModal = () => {
  showAddLeaveTypeModal.value = false;
  newLeaveTypeForm.value = { name: '' };
};

/**
 * 新增自訂假別（送 API）
 */
const addCustomLeaveType = async () => {
  // 客戶端驗證：單一中文字
  const chineseCharRegex = /^[\u4e00-\u9fa5]$/;
  if (!chineseCharRegex.test(newLeaveTypeForm.value.name)) {
    alert('假別名稱必須為單一中文字');
    return;
  }

  try {
    const response = await axios.post('/api/leave-types', {
      name: newLeaveTypeForm.value.name
    });

    if (response.data.success) {
      alert('自定義假別新增成功！');
      closeAddLeaveTypeModal();
      await loadCustomLeaveTypes();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else if (error.response?.data?.errors) {
      const errors = Object.values(error.response.data.errors).flat();
      alert('驗證錯誤：\n' + errors.join('\n'));
    } else {
      alert('新增假別失敗');
    }
  }
};

/**
 * 刪除自訂假別（軟刪除）
 */
const deleteCustomLeaveType = async () => {
  const selectedType = customLeaveTypes.value.find(t => t.code === leaveTypeMode.value);

  if (!selectedType) {
    alert('找不到選中的假別');
    return;
  }

  if (!confirm(`確定要刪除自定義假別「${selectedType.name}」嗎？\n\n刪除後該假別將不再顯示於列表中，但歷史班表記錄仍會保留。`)) {
    return;
  }

  try {
    const response = await axios.delete(`/api/leave-types/${selectedType.id}`);

    if (response.data.success) {
      alert('自定義假別已刪除！');
      leaveTypeMode.value = null;
      await loadCustomLeaveTypes();
    }
  } catch (error) {
    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert('刪除假別失敗');
    }
  }
};

/**
 * 根據 code 取得自訂假別的名稱
 */
const getCustomLeaveTypeName = (code) => {
  if (!code || !code.startsWith('custom_')) return '';

  const customType = customLeaveTypes.value.find(t => t.code === code);
  return customType ? customType.name : '';
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
  await loadCustomLeaveTypes();

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

/* Sticky table headers */
.sticky-header-row-1 {
  position: sticky;
  top: 0;
  z-index: 20;
}

.sticky-header-row-1 th {
  background-color: #f3f4f6 !important;
}

.sticky-header-row-2 {
  position: sticky;
  top: 44px; /* 第一行的高度，根據實際調整 */
  z-index: 20;
}

.sticky-header-row-2 th {
  background-color: #f9fafb !important;
}

/* 確保左側固定列的 z-index 更高 */
.sticky-header-row-1 th.sticky,
.sticky-header-row-2 th.sticky {
  z-index: 30;
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
