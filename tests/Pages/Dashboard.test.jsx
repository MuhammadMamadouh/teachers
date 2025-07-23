import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import Dashboard from '@/Pages/Dashboard'

// Mock Inertia router
vi.mock('@inertiajs/react', () => ({
  router: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  Head: ({ title }) => <title>{title}</title>,
  Link: ({ href, children, ...props }) => <a href={href} {...props}>{children}</a>,
}))

// Mock AuthenticatedLayout
vi.mock('@/Layouts/AuthenticatedLayout', () => ({
  default: ({ header, children }) => (
    <div data-testid="authenticated-layout">
      <header data-testid="header">{header}</header>
      <main data-testid="main-content">{children}</main>
    </div>
  ),
}))

// Mock StartNewTermModal
vi.mock('@/Components/StartNewTermModal', () => ({
  default: ({ show, onClose, onSuccess }) => (
    show ? (
      <div data-testid="start-new-term-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Start New Term</button>
      </div>
    ) : null
  ),
}))

// Mock route function
global.route = vi.fn((name, _params) => {
  const routes = {
    'dashboard.today-sessions': '/dashboard/today-sessions',
    'dashboard.reports': '/dashboard/reports',
    'students.index': '/students',
    'groups.index': '/groups',
    'attendance.index': '/attendance',
    'plans.index': '/plans',
    'students.create': '/students/create',
    'groups.create': '/groups/create',
  }
  return routes[name] || `/${name}`
})

// Mock fetch
global.fetch = vi.fn()

describe('Teacher Dashboard Page', () => {
  const mockSubscriptionLimits = {
    max_students: 50,
    has_active_subscription: true,
    plan: {
      name: 'الخطة المتقدمة',
      price: 299
    }
  }

  const mockTodaySessionsData = [
    {
      id: 1,
      group_name: 'مجموعة الرياضيات',
      start_time: '10:00',
      end_time: '11:00',
      student_count: 15,
      subject: 'الرياضيات'
    },
    {
      id: 2,
      group_name: 'مجموعة العلوم',
      start_time: '14:00',
      end_time: '15:30',
      student_count: 12,
      subject: 'العلوم'
    }
  ]

  const mockReportsData = {
    financial: {
      total_expected_monthly_income: 15000,
      total_collected_payments: 12000,
      pending_payments: 3000,
      collection_rate: 80,
      average_student_price: 300
    },
    groups: {
      total_groups: 8,
      total_students_in_groups: 45,
      total_students_without_group: 5,
      average_students_per_group: 5.6
    },
    attendance: {
      total_sessions_this_month: 32,
      overall_attendance_rate: 85,
      best_attendance_group: 'مجموعة الرياضيات',
      worst_attendance_group: 'مجموعة التاريخ'
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful API responses
    global.fetch.mockImplementation((url) => {
      if (url.includes('today-sessions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodaySessionsData)
        })
      }
      if (url.includes('reports')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReportsData)
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Component Rendering', () => {
    test('renders dashboard with correct title', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('لوحة التحكم')).toBeInTheDocument()
      expect(screen.getByTitle('لوحة التحكم')).toBeInTheDocument()
    })

    test('renders welcome section', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('مرحباً بك مرة أخرى!')).toBeInTheDocument()
      expect(screen.getByText('قم بإدارة طلابك وتتبع حضورهم.')).toBeInTheDocument()
    })

    test('renders error message when provided', () => {
      const errorMessage = 'حدث خطأ في تحميل البيانات'
      
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
          error={errorMessage}
        />
      )

      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    test('renders assistant banner when isAssistant is true', () => {
      const teacherName = 'أحمد محمد'
      
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
          isAssistant={true}
          teacherName={teacherName}
        />
      )

      expect(screen.getByText('مساعد معلم')).toBeInTheDocument()
      expect(screen.getByText(`أنت تعمل كمساعد للمعلم ${teacherName}`)).toBeInTheDocument()
    })
  })

  describe('Subscription Status Cards', () => {
    test('displays student count and limits correctly', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('الطلاب')).toBeInTheDocument()
      expect(screen.getByText('45 من 50')).toBeInTheDocument()
      expect(screen.getByText('خطة نشطة')).toBeInTheDocument()
      expect(screen.getByText('خطة الخطة المتقدمة')).toBeInTheDocument()
    })

    test('displays subscription status correctly when active', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('الاشتراك')).toBeInTheDocument()
      expect(screen.getByText('نشط')).toBeInTheDocument()
      expect(screen.getByText('خطة الخطة المتقدمة')).toBeInTheDocument()
    })

    test('displays subscription status correctly when inactive', () => {
      const inactiveSubscription = {
        ...mockSubscriptionLimits,
        has_active_subscription: false,
        plan: null
      }

      render(
        <Dashboard
          subscriptionLimits={inactiveSubscription}
          currentStudentCount={45}
          canAddStudents={false}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('غير نشط')).toBeInTheDocument()
      expect(screen.getByText('لا توجد خطة')).toBeInTheDocument()
    })

    test('displays add students status correctly', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('إضافة طلاب')).toBeInTheDocument()
      expect(screen.getByText('متاح')).toBeInTheDocument()
      expect(screen.getByText('5 مقعد متبقي')).toBeInTheDocument()
    })

    test('displays add students status when limit reached', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={50}
          canAddStudents={false}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('تم الوصول للحد الأقصى')).toBeInTheDocument()
      expect(screen.getByText('0 مقعد متبقي')).toBeInTheDocument()
    })
  })

  describe('Today Sessions Section', () => {
    test('displays loading state initially', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('جاري تحميل جلسات اليوم...')).toBeInTheDocument()
    })

    test('displays today sessions after loading', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('جلسات اليوم')).toBeInTheDocument()
        expect(screen.getByText('مجموعة الرياضيات')).toBeInTheDocument()
        expect(screen.getByText('مجموعة العلوم')).toBeInTheDocument()
      })

      expect(screen.getByText('10:00 - 11:00')).toBeInTheDocument()
      expect(screen.getByText('14:00 - 15:30')).toBeInTheDocument()
      expect(screen.getByText('15 طالب')).toBeInTheDocument()
      expect(screen.getByText('12 طالب')).toBeInTheDocument()
    })

    test('displays no sessions message when no sessions today', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('today-sessions')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([])
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReportsData)
        })
      })

      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('لا توجد جلسات اليوم')).toBeInTheDocument()
      })
    })
  })

  describe('Reports Section', () => {
    test('displays loading state initially', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      expect(screen.getByText('جاري تحميل التقارير...')).toBeInTheDocument()
    })

    test('displays financial reports correctly', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('التقارير المالية')).toBeInTheDocument()
        expect(screen.getByText('15,000 ج.م')).toBeInTheDocument()
        expect(screen.getByText('12,000 ج.م')).toBeInTheDocument()
        expect(screen.getByText('3,000 ج.م')).toBeInTheDocument()
        expect(screen.getByText('80%')).toBeInTheDocument()
        expect(screen.getByText('300 ج.م')).toBeInTheDocument()
      })
    })

    test('displays groups and students reports correctly', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('تقارير المجموعات والطلاب')).toBeInTheDocument()
        expect(screen.getByText('8')).toBeInTheDocument() // total groups
        expect(screen.getByText('45')).toBeInTheDocument() // students in groups
        expect(screen.getByText('5')).toBeInTheDocument() // students without group
        expect(screen.getByText('5.6')).toBeInTheDocument() // average students per group
      })
    })

    test('displays attendance reports correctly', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('تقارير الحضور')).toBeInTheDocument()
        expect(screen.getByText('85%')).toBeInTheDocument() // attendance rate
        expect(screen.getByText('32')).toBeInTheDocument() // total sessions this month
      })
    })
  })

  describe('Quick Actions', () => {
    test('displays quick action buttons', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('إضافة طالب جديد')).toBeInTheDocument()
        expect(screen.getByText('إنشاء مجموعة جديدة')).toBeInTheDocument()
        expect(screen.getByText('تسجيل الحضور')).toBeInTheDocument()
        expect(screen.getByText('إدارة الخطط')).toBeInTheDocument()
      })
    })

    test('quick action buttons have correct links', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        const addStudentLink = screen.getByText('إضافة طالب جديد').closest('a')
        const createGroupLink = screen.getByText('إنشاء مجموعة جديدة').closest('a')
        const attendanceLink = screen.getByText('تسجيل الحضور').closest('a')
        const plansLink = screen.getByText('إدارة الخطط').closest('a')

        expect(addStudentLink).toHaveAttribute('href', '/students/create')
        expect(createGroupLink).toHaveAttribute('href', '/groups/create')
        expect(attendanceLink).toHaveAttribute('href', '/attendance')
        expect(plansLink).toHaveAttribute('href', '/plans')
      })
    })
  })

  describe('Term Reset Modal', () => {
    test('shows start new term button when available', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('بدء فصل دراسي جديد')).toBeInTheDocument()
      })
    })

    test('opens modal when start new term button is clicked', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        const startNewTermButton = screen.getByText('بدء فصل دراسي جديد')
        fireEvent.click(startNewTermButton)
      })

      expect(screen.getByTestId('start-new-term-modal')).toBeInTheDocument()
    })
  })

  describe('API Error Handling', () => {
    test('handles today sessions API error gracefully', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('today-sessions')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReportsData)
        })
      })

      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.queryByText('جاري تحميل جلسات اليوم...')).not.toBeInTheDocument()
      })
    })

    test('handles reports API error gracefully', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('reports')) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTodaySessionsData)
        })
      })

      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.queryByText('جاري تحميل التقارير...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Data Validation', () => {
    test('validates subscription limits data structure', () => {
      const subscriptionLimits = {
        max_students: 50,
        has_active_subscription: true,
        plan: {
          name: 'الخطة المتقدمة',
          price: 299
        }
      }

      expect(subscriptionLimits).toHaveProperty('max_students')
      expect(subscriptionLimits).toHaveProperty('has_active_subscription')
      expect(subscriptionLimits).toHaveProperty('plan')
      expect(subscriptionLimits.plan).toHaveProperty('name')
      expect(subscriptionLimits.plan).toHaveProperty('price')
    })

    test('validates today sessions data structure', () => {
      const session = mockTodaySessionsData[0]

      expect(session).toHaveProperty('id')
      expect(session).toHaveProperty('group_name')
      expect(session).toHaveProperty('start_time')
      expect(session).toHaveProperty('end_time')
      expect(session).toHaveProperty('student_count')
      expect(session).toHaveProperty('subject')
    })

    test('validates reports data structure', () => {
      expect(mockReportsData).toHaveProperty('financial')
      expect(mockReportsData).toHaveProperty('groups')
      expect(mockReportsData).toHaveProperty('attendance')

      expect(mockReportsData.financial).toHaveProperty('total_expected_monthly_income')
      expect(mockReportsData.financial).toHaveProperty('total_collected_payments')
      expect(mockReportsData.financial).toHaveProperty('pending_payments')
      expect(mockReportsData.financial).toHaveProperty('collection_rate')
      expect(mockReportsData.financial).toHaveProperty('average_student_price')

      expect(mockReportsData.groups).toHaveProperty('total_groups')
      expect(mockReportsData.groups).toHaveProperty('total_students_in_groups')
      expect(mockReportsData.groups).toHaveProperty('total_students_without_group')
      expect(mockReportsData.groups).toHaveProperty('average_students_per_group')

      expect(mockReportsData.attendance).toHaveProperty('total_sessions_this_month')
      expect(mockReportsData.attendance).toHaveProperty('overall_attendance_rate')
    })
  })

  describe('Arabic Text Handling', () => {
    test('handles Arabic text properly in welcome message', () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      const welcomeText = 'مرحباً بك مرة أخرى!'
      const descriptionText = 'قم بإدارة طلابك وتتبع حضورهم.'

      expect(screen.getByText(welcomeText)).toBeInTheDocument()
      expect(screen.getByText(descriptionText)).toBeInTheDocument()
    })

    test('handles Arabic text in section titles', async () => {
      render(
        <Dashboard
          subscriptionLimits={mockSubscriptionLimits}
          currentStudentCount={45}
          canAddStudents={true}
          availablePlans={[]}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('التقارير المالية')).toBeInTheDocument()
        expect(screen.getByText('تقارير المجموعات والطلاب')).toBeInTheDocument()
        expect(screen.getByText('تقارير الحضور')).toBeInTheDocument()
      })
    })
  })
})
