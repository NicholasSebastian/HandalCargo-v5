# Handal Cargo v5

The fifth and final reiteration of PT. Handal Cargo's proprietary ERP system.  
Uses Ant Design for UI components.

## To Do List

### Content

- Invoice Entry
- Payment
- Company Setup

### Features

- Dashboard
- Language (English / Indonesian)
- Images for Profiles
- Mail?
- Backup and Restore?
- Shortcuts?

### Known Bugs and Issues

#### Top Priority Issues

- Air Cargo and Sea Freight 'add' forms not calculating marking values properly.
- Inserting marking values fail due to a foreign key constraint; marking values 'marking' field should select from 'customermarkings'.
- Inserting item values in customers fail due to foreign key constraint.
- Prevent new Marking Table and Item Table entries from being added with empty values.

#### Mid Priority Issues

- In-Form tables such as marking tables and item tables should have a max height and scroll.

#### Low Priority Issues

- Calculator should automatically focus on Input when opened.
- Inputting long text in the To-Do-List Input gets covered by the plus icon.
