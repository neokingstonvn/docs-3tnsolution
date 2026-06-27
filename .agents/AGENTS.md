# Workspace Agent Skills Catalog

Thư mục này cấu hình các kỹ năng chuyên biệt (Agent Skills) cho Gemini (Antigravity IDE) trong workspace này để thực thi quy trình thiết kế, lập kế hoạch, và sinh mẫu thử nghiệm (UAT Prototype) cho dự án mới theo đúng cấu trúc và phong cách thiết kế sáng màu thanh lịch của `mvp`.

## 5 Active Skills Cốt Lõi

1. **[project-orchestrator](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/project-orchestrator/SKILL.md)**
   - **Mục tiêu**: Nhận yêu cầu thô của dự án mới, phân tích và hướng dẫn người dùng gọi tuần tự các skill tiếp theo để đảm bảo tính đồng bộ dữ liệu.
2. **[spec-generator](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/spec-generator/SKILL.md)**
   - **Mục tiêu**: Xây dựng tài liệu đặc tả chức năng tổng thể (`README.md`) và dashboard đặc tả HTML sáng màu thanh lịch (`index.html`) trực tiếp tại thư mục gốc của dự án với đầy đủ scope matrix, roles, mô tả module và luồng happy path.

3. **[implementation-planner](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/implementation-planner/SKILL.md)**
   - **Mục tiêu**: Thiết kế kiến trúc Clean Architecture, database DDL SQL, sơ đồ API sync, timeline các giai đoạn, lập kế hoạch MVP tổng thể (`mvp/plan-high-level/index.html`), kế hoạch triển khai chi tiết cho MVP (`mvp/plan-detailed/index.html`) và kế hoạch dài hạn cho các tính năng sau MVP (`mmp/index.html`).

4. **[slide-generator](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/slide-generator/SKILL.md)**
   - **Mục tiêu**: Soạn slide thuyết trình dự án (`presentation/index.html`) chạy trực tiếp trên trình duyệt theo phong cách sáng màu thanh lịch, tối ưu hiển thị font và slide layouts.

5. **[prototype-generator](file:///Users/lcnghia95/workspace/3tn/docs-3tn/.agents/skills/prototype-generator/SKILL.md)**
   - **Mục tiêu**: Tự động sinh ra prototype tương tác UAT đầy đủ (gateway portal `prototype/index.html`, các sub-portal tương ứng với roles, database mock bằng localStorage trong file `db.js`, sử dụng CSS variables sáng màu v2).

## Cấu Trúc Thư Mục

```bash
.agents/
├── AGENTS.md                         # File danh mục này
└── skills/
    ├── project-orchestrator/          # Điều phối toàn bộ quy trình
    │   ├── SKILL.md
    │   └── references/
    │       └── orchestration-guide.md
    ├── spec-generator/                # Sinh đặc tả & dashboard đặc tả
    │   ├── SKILL.md
    │   ├── templates/
    │   │   └── spec-dashboard.html
    │   └── references/
    │       └── spec-guide.md
    ├── implementation-planner/        # Lập kế hoạch kỹ thuật & DB schema
    │   ├── SKILL.md
    │   ├── templates/
    │   │   └── plan-dashboard.html
    │   └── references/
    │       └── planning-guide.md
    ├── slide-generator/               # Sinh slide thuyết trình HTML/CSS
    │   ├── SKILL.md
    │   ├── templates/
    │   │   ├── slide-deck.html
    │   │   └── presentation.css
    │   └── references/
    │       └── presentation-guide.md
    └── prototype-generator/           # Sinh prototype tương tác Mock localStorage
        ├── SKILL.md
        ├── templates/
        │   ├── prototype-gateway.html
        │   ├── prototype-portal.html
        │   ├── db.js
        │   └── style.css
        └── references/
            └── prototype-guide.md
```
