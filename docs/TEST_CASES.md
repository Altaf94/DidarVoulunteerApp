# Volunteer Management System - Test Cases
## Didar Mubarak Pakistan - QA Testing Documentation

---

## 📋 Table of Contents
1. [Authentication Tests](#1-authentication-tests)
2. [Maker Workflow Tests](#2-maker-workflow-tests)
3. [Checker Workflow Tests](#3-checker-workflow-tests)
4. [Dashboard Tests](#4-dashboard-tests)
5. [Validation Rules Tests](#5-validation-rules-tests)
6. [API Integration Tests](#6-api-integration-tests)

---

## 1. Authentication Tests

### 1.1 Login Tests

#### TC-AUTH-001: Valid Login
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-001 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Authentication |
| **Description** | Verify user can login with valid credentials |
| **Preconditions** | User account exists in the system |
| **Test Steps** | 1. Navigate to Login screen<br>2. Enter valid email<br>3. Enter valid password<br>4. Tap "Login" button |
| **Test Data** | Email: maker@test.com, Password: Test@123 |
| **Expected Result** | User is redirected to appropriate dashboard based on role |
| **Status** | - |

#### TC-AUTH-002: Invalid Password
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-002 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | Authentication |
| **Description** | Verify system rejects invalid password |
| **Preconditions** | User account exists |
| **Test Steps** | 1. Navigate to Login screen<br>2. Enter valid email<br>3. Enter wrong password<br>4. Tap "Login" button |
| **Test Data** | Email: maker@test.com, Password: WrongPass |
| **Expected Result** | Error message "Invalid credentials" displayed |
| **Status** | - |

#### TC-AUTH-003: Empty Email Field
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-003 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Authentication |
| **Description** | Verify validation for empty email |
| **Preconditions** | None |
| **Test Steps** | 1. Navigate to Login screen<br>2. Leave email empty<br>3. Enter password<br>4. Tap "Login" button |
| **Test Data** | Email: (empty), Password: Test@123 |
| **Expected Result** | Error message "Email is required" displayed |
| **Status** | - |

#### TC-AUTH-004: Invalid Email Format
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-004 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Authentication |
| **Description** | Verify email format validation |
| **Preconditions** | None |
| **Test Steps** | 1. Enter invalid email format<br>2. Enter password<br>3. Tap "Login" button |
| **Test Data** | Email: invalidemailformat, Password: Test@123 |
| **Expected Result** | Error message "Invalid email format" displayed |
| **Status** | - |

#### TC-AUTH-005: Session Timeout
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-005 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Authentication |
| **Description** | Verify session expires after timeout |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Login successfully<br>2. Leave app idle for 30 minutes<br>3. Try to perform any action |
| **Test Data** | NA |
| **Expected Result** | User is redirected to login screen |
| **Status** | - |

#### TC-AUTH-006: Logout
| Field | Value |
|-------|-------|
| **Test ID** | TC-AUTH-006 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Authentication |
| **Description** | Verify user can logout successfully |
| **Preconditions** | User is logged in |
| **Test Steps** | 1. Tap on profile icon<br>2. Select "Logout"<br>3. Confirm logout |
| **Test Data** | NA |
| **Expected Result** | User is logged out and redirected to login screen |
| **Status** | - |

---

## 2. Maker Workflow Tests

### 2.1 File Upload Tests

#### TC-UPLOAD-001: Valid Excel Upload
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-001 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Data Upload |
| **Description** | Verify valid Excel file uploads successfully |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Navigate to Upload screen<br>2. Select region "Gilgit"<br>3. Select source "Local Council"<br>4. Pick valid Excel file<br>5. Tap "Upload & Validate" |
| **Test Data** | volunteers_gilgit.xlsx with 50 records |
| **Expected Result** | File uploads, validation runs, summary shows valid/rejected/discrepant counts |
| **Status** | - |

#### TC-UPLOAD-002: Invalid File Format
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-002 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | Data Upload |
| **Description** | Verify system rejects non-Excel files |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Navigate to Upload screen<br>2. Try to pick a PDF file |
| **Test Data** | document.pdf |
| **Expected Result** | Error message "Only .xlsx or .xls files are allowed" |
| **Status** | - |

#### TC-UPLOAD-003: Empty Excel File
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-003 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Data Upload |
| **Description** | Verify system handles empty Excel file |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Upload Excel file with no data rows |
| **Test Data** | empty_file.xlsx (headers only) |
| **Expected Result** | Error message "No data found in file" |
| **Status** | - |

#### TC-UPLOAD-004: Missing Required Columns
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-004 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | Data Upload |
| **Description** | Verify system validates required columns |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Upload Excel without CNIC column |
| **Test Data** | missing_cnic_column.xlsx |
| **Expected Result** | Error message "Required column 'CNIC' is missing" |
| **Status** | - |

#### TC-UPLOAD-005: Invalid CNIC Format
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-005 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | Data Upload |
| **Description** | Verify CNIC format validation |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Upload Excel with invalid CNIC formats |
| **Test Data** | CNIC: "123456" (invalid format) |
| **Expected Result** | Record marked as invalid with error "Invalid CNIC format" |
| **Status** | - |

#### TC-UPLOAD-006: Without Selecting Region
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-006 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | Data Upload |
| **Description** | Verify region selection is mandatory |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Navigate to Upload<br>2. Select file without selecting region<br>3. Tap Upload |
| **Test Data** | NA |
| **Expected Result** | Error message "Please select a region" |
| **Status** | - |

#### TC-UPLOAD-007: Large File Upload (1000+ records)
| Field | Value |
|-------|-------|
| **Test ID** | TC-UPLOAD-007 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Data Upload |
| **Description** | Verify system handles large file uploads |
| **Preconditions** | User logged in as Maker |
| **Test Steps** | 1. Upload Excel with 1000+ records<br>2. Wait for processing |
| **Test Data** | large_batch.xlsx (1500 records) |
| **Expected Result** | File processes successfully with progress indication |
| **Status** | - |

### 2.2 Approval/Rejection Tests

#### TC-APPROVE-001: Approve Single Valid Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-APPROVE-001 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Approval |
| **Description** | Verify Maker can approve a valid record |
| **Preconditions** | Valid records exist from upload |
| **Test Steps** | 1. Navigate to Review screen<br>2. Select a valid record<br>3. Tap "Approve" |
| **Test Data** | Volunteer ID: VOL-001 |
| **Expected Result** | Record status changes to "Approved" |
| **Status** | - |

#### TC-APPROVE-002: Bulk Approve Multiple Records
| Field | Value |
|-------|-------|
| **Test ID** | TC-APPROVE-002 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Approval |
| **Description** | Verify bulk approval functionality |
| **Preconditions** | Multiple valid records exist |
| **Test Steps** | 1. Select all valid records<br>2. Tap "Approve" button |
| **Test Data** | 10 valid records |
| **Expected Result** | All selected records become "Approved" |
| **Status** | - |

#### TC-APPROVE-003: Reject Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-APPROVE-003 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Approval |
| **Description** | Verify Maker can reject a record |
| **Preconditions** | Records exist for review |
| **Test Steps** | 1. Select a discrepant record<br>2. Tap "Reject"<br>3. Confirm rejection |
| **Test Data** | Volunteer with duplicate duty |
| **Expected Result** | Record status changes to "Rejected" |
| **Status** | - |

#### TC-APPROVE-004: Approve Discrepant Record
| Field | Value |
|-------|-------|
| **Test ID** | TC-APPROVE-004 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Approval |
| **Description** | Verify Maker can approve discrepant record after review |
| **Preconditions** | Discrepant record exists |
| **Test Steps** | 1. Filter by "Discrepant" status<br>2. Review discrepancy details<br>3. Approve the record |
| **Test Data** | Volunteer with multiple duties |
| **Expected Result** | Record is approved despite discrepancy |
| **Status** | - |

#### TC-APPROVE-005: Approve Without Selection
| Field | Value |
|-------|-------|
| **Test ID** | TC-APPROVE-005 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Approval |
| **Description** | Verify approval without selecting records |
| **Preconditions** | User on Review screen |
| **Test Steps** | 1. Don't select any records<br>2. Try to tap Approve |
| **Test Data** | NA |
| **Expected Result** | Error "Please select volunteers to approve" or button disabled |
| **Status** | - |

### 2.3 Submission Tests

#### TC-SUBMIT-001: Submit Approved Records
| Field | Value |
|-------|-------|
| **Test ID** | TC-SUBMIT-001 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Submission |
| **Description** | Verify submission of approved records to Checker |
| **Preconditions** | Approved records exist |
| **Test Steps** | 1. Navigate to Review screen<br>2. Tap "Submit to Checker"<br>3. Confirm submission |
| **Test Data** | 25 approved records |
| **Expected Result** | Records status changes to "Submitted", Volunteer IDs generated |
| **Status** | - |

#### TC-SUBMIT-002: Volunteer ID Generation
| Field | Value |
|-------|-------|
| **Test ID** | TC-SUBMIT-002 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Submission |
| **Description** | Verify unique Volunteer ID is generated on submission |
| **Preconditions** | Record is being submitted first time |
| **Test Steps** | 1. Submit new volunteer record<br>2. Check generated ID |
| **Test Data** | New volunteer with CNIC 12345-1234567-1 |
| **Expected Result** | Volunteer ID format: VID-XXXXXX (unique, persists across events) |
| **Status** | - |

#### TC-SUBMIT-003: Same Volunteer ID for Same CNIC
| Field | Value |
|-------|-------|
| **Test ID** | TC-SUBMIT-003 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Submission |
| **Description** | Verify same CNIC gets same Volunteer ID |
| **Preconditions** | Volunteer already exists in system |
| **Test Steps** | 1. Upload same CNIC for different event<br>2. Submit record<br>3. Check Volunteer ID |
| **Test Data** | Existing CNIC for Event 2 |
| **Expected Result** | Same Volunteer ID is assigned |
| **Status** | - |

#### TC-SUBMIT-004: Submit Without Approved Records
| Field | Value |
|-------|-------|
| **Test ID** | TC-SUBMIT-004 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Submission |
| **Description** | Verify submission button state with no approved records |
| **Preconditions** | No approved records available |
| **Test Steps** | 1. Navigate to Review<br>2. Check "Submit to Checker" button |
| **Test Data** | NA |
| **Expected Result** | Button is disabled or shows message "No approved records" |
| **Status** | - |

---

## 3. Checker Workflow Tests

### 3.1 Review Tests

#### TC-CHECK-001: View Submitted Records (National)
| Field | Value |
|-------|-------|
| **Test ID** | TC-CHECK-001 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Checker Review |
| **Description** | Verify National Checker can view all regions |
| **Preconditions** | Login as National Checker |
| **Test Steps** | 1. Navigate to Review screen<br>2. Check available regions |
| **Test Data** | NA |
| **Expected Result** | All 6 regions are visible with their submitted records |
| **Status** | - |

#### TC-CHECK-002: View Submitted Records (Regional)
| Field | Value |
|-------|-------|
| **Test ID** | TC-CHECK-002 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Checker Review |
| **Description** | Verify Regional Checker can view only their region |
| **Preconditions** | Login as Regional Checker (Gilgit) |
| **Test Steps** | 1. Navigate to Review screen<br>2. Check visible records |
| **Test Data** | NA |
| **Expected Result** | Only Gilgit region records are visible |
| **Status** | - |

#### TC-CHECK-003: Filter by Access Level
| Field | Value |
|-------|-------|
| **Test ID** | TC-CHECK-003 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Checker Review |
| **Description** | Verify filtering by access level |
| **Preconditions** | Submitted records exist |
| **Test Steps** | 1. Open filter<br>2. Select "Stage" access level<br>3. Apply filter |
| **Test Data** | NA |
| **Expected Result** | Only Stage access level records displayed |
| **Status** | - |

### 3.2 Print Tests

#### TC-PRINT-001: Print Single Badge
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-001 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Badge Printing |
| **Description** | Verify single badge printing |
| **Preconditions** | Approved record exists |
| **Test Steps** | 1. Navigate to Print Badges<br>2. Select one record<br>3. Tap Print |
| **Test Data** | 1 approved record |
| **Expected Result** | Badge generated with correct info and band color |
| **Status** | - |

#### TC-PRINT-002: Batch Print Badges
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-002 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Badge Printing |
| **Description** | Verify batch badge printing |
| **Preconditions** | Multiple approved records exist |
| **Test Steps** | 1. Select all records<br>2. Tap Print<br>3. Confirm batch print |
| **Test Data** | 50 approved records |
| **Expected Result** | All badges printed, status updated to "Printed" |
| **Status** | - |

#### TC-PRINT-003: Badge Contains Correct Information
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-003 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Badge Printing |
| **Description** | Verify badge content accuracy |
| **Preconditions** | Badge is generated |
| **Test Steps** | 1. Generate badge<br>2. Verify all fields |
| **Test Data** | Name: Ali Khan, CNIC: 12345-1234567-1, Duty: Security, Event: 1 |
| **Expected Result** | Badge shows: Name, CNIC, Volunteer ID, Event, Duty, Access Level, QR Code, Correct band color |
| **Status** | - |

#### TC-PRINT-004: Band Color by Access Level
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-004 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Badge Printing |
| **Description** | Verify correct band color for each access level |
| **Preconditions** | Records with different access levels |
| **Test Steps** | 1. Print badge for Stage volunteer<br>2. Print badge for Pandal volunteer<br>3. Verify colors |
| **Test Data** | Stage: Gold, Pandal: Royal Blue |
| **Expected Result** | Each badge has correct band color per access level |
| **Status** | - |

#### TC-PRINT-005: Generate Covering Sheet
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-005 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Badge Printing |
| **Description** | Verify covering sheet generation |
| **Preconditions** | Badges are printed |
| **Test Steps** | 1. After printing, tap "Generate Covering Sheet"<br>2. View generated sheets |
| **Test Data** | Print batch of 20 badges |
| **Expected Result** | Covering sheets grouped by access level with CNIC, Name, Signature columns |
| **Status** | - |

#### TC-PRINT-006: Print Already Printed Records
| Field | Value |
|-------|-------|
| **Test ID** | TC-PRINT-006 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Badge Printing |
| **Description** | Verify system prevents re-printing |
| **Preconditions** | Records already printed |
| **Test Steps** | 1. Navigate to Print<br>2. Try to select printed records |
| **Test Data** | NA |
| **Expected Result** | Already printed records not shown or marked as printed |
| **Status** | - |

### 3.3 Dispatch Tests

#### TC-DISPATCH-001: Create Dispatch Package
| Field | Value |
|-------|-------|
| **Test ID** | TC-DISPATCH-001 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Dispatch |
| **Description** | Verify creating a new dispatch package |
| **Preconditions** | Printed badges exist |
| **Test Steps** | 1. Navigate to Dispatch<br>2. Tap "New Package"<br>3. Select destination<br>4. Confirm |
| **Test Data** | Destination: Local Council Gilgit |
| **Expected Result** | Package created with status "Preparing" |
| **Status** | - |

#### TC-DISPATCH-002: Package Contains All Items
| Field | Value |
|-------|-------|
| **Test ID** | TC-DISPATCH-002 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Dispatch |
| **Description** | Verify package contents |
| **Preconditions** | Package is prepared |
| **Test Steps** | 1. View package details<br>2. Verify contents |
| **Test Data** | NA |
| **Expected Result** | Package shows: Badge count, Band count, Covering sheets |
| **Status** | - |

#### TC-DISPATCH-003: Dispatch Package
| Field | Value |
|-------|-------|
| **Test ID** | TC-DISPATCH-003 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Dispatch |
| **Description** | Verify dispatching a package |
| **Preconditions** | Package is ready |
| **Test Steps** | 1. Select package<br>2. Tap "Dispatch"<br>3. Confirm |
| **Test Data** | Package PKG-001 |
| **Expected Result** | Package status changes to "Dispatched", timestamp recorded |
| **Status** | - |

#### TC-DISPATCH-004: Dispatch to Different Sources
| Field | Value |
|-------|-------|
| **Test ID** | TC-DISPATCH-004 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Dispatch |
| **Description** | Verify dispatch to different source types |
| **Preconditions** | Badges printed for different sources |
| **Test Steps** | 1. Create package for ITREB<br>2. Create package for Health Board<br>3. Dispatch both |
| **Test Data** | ITREB package, Health Board package |
| **Expected Result** | Both packages dispatched to correct destinations |
| **Status** | - |

#### TC-DISPATCH-005: Dispatch Without Destination
| Field | Value |
|-------|-------|
| **Test ID** | TC-DISPATCH-005 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Dispatch |
| **Description** | Verify destination is required |
| **Preconditions** | Creating new package |
| **Test Steps** | 1. Tap "New Package"<br>2. Don't select destination<br>3. Tap Create |
| **Test Data** | NA |
| **Expected Result** | Error "Please select a destination" |
| **Status** | - |

---

## 4. Dashboard Tests

### 4.1 National Dashboard Tests

#### TC-DASH-001: View National Statistics
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-001 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Dashboard |
| **Description** | Verify national level statistics display |
| **Preconditions** | Login as National level user |
| **Test Steps** | 1. Navigate to Dashboard<br>2. View statistics |
| **Test Data** | NA |
| **Expected Result** | Shows: Required, Received, Validated, Approved, Printed, Dispatched counts |
| **Status** | - |

#### TC-DASH-002: Required vs Received Chart
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-002 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Dashboard |
| **Description** | Verify Required vs Received progress bar |
| **Preconditions** | Data exists in system |
| **Test Steps** | 1. View progress bar<br>2. Verify percentage |
| **Test Data** | Required: 1000, Received: 750 |
| **Expected Result** | Progress bar shows 75% with correct color coding |
| **Status** | - |

#### TC-DASH-003: Regional Progress View
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-003 |
| **Type** | Positive |
| **Priority** | High |
| **Module** | Dashboard |
| **Description** | Verify regional breakdown display |
| **Preconditions** | National level access |
| **Test Steps** | 1. Scroll to regional section<br>2. View all 6 regions |
| **Test Data** | NA |
| **Expected Result** | All 6 regions displayed with individual progress |
| **Status** | - |

#### TC-DASH-004: Event-wise Statistics
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-004 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Dashboard |
| **Description** | Verify event-wise breakdown |
| **Preconditions** | Data exists for multiple events |
| **Test Steps** | 1. View event section<br>2. Tap on an event card |
| **Test Data** | NA |
| **Expected Result** | Shows all 9 events with progress, expandable details |
| **Status** | - |

#### TC-DASH-005: Access Level Statistics
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-005 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Dashboard |
| **Description** | Verify access level breakdown |
| **Preconditions** | Data exists |
| **Test Steps** | 1. View access level section |
| **Test Data** | NA |
| **Expected Result** | Shows all 5 access levels with progress bars and colors |
| **Status** | - |

#### TC-DASH-006: Pull to Refresh
| Field | Value |
|-------|-------|
| **Test ID** | TC-DASH-006 |
| **Type** | Positive |
| **Priority** | Medium |
| **Module** | Dashboard |
| **Description** | Verify dashboard refresh |
| **Preconditions** | Dashboard loaded |
| **Test Steps** | 1. Pull down on screen<br>2. Release |
| **Test Data** | NA |
| **Expected Result** | Dashboard refreshes with latest data |
| **Status** | - |

---

## 5. Validation Rules Tests

### 5.1 CNIC Validation

#### TC-VAL-001: Valid CNIC in Enrollment System
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-001 |
| **Type** | Positive |
| **Priority** | Critical |
| **Module** | Validation |
| **Description** | Verify CNIC exists in Enrollment System |
| **Preconditions** | CNIC registered in Enrollment |
| **Test Steps** | 1. Upload record with valid CNIC |
| **Test Data** | CNIC: 12345-1234567-1 (registered) |
| **Expected Result** | Record marked as "Valid" |
| **Status** | - |

#### TC-VAL-002: CNIC Not Found
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-002 |
| **Type** | Negative |
| **Priority** | Critical |
| **Module** | Validation |
| **Description** | Verify CNIC not in Enrollment System |
| **Preconditions** | CNIC not registered |
| **Test Steps** | 1. Upload record with unregistered CNIC |
| **Test Data** | CNIC: 99999-9999999-9 (not registered) |
| **Expected Result** | Record marked as "Rejected" with error "CNIC not found" |
| **Status** | - |

### 5.2 Duplicate Detection

#### TC-VAL-003: Same Duty Same Event Duplicate
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-003 |
| **Type** | Negative |
| **Priority** | Critical |
| **Module** | Validation |
| **Description** | Verify duplicate same duty rejection |
| **Preconditions** | Person already assigned duty in event |
| **Test Steps** | 1. Upload same CNIC with same duty for same event |
| **Test Data** | CNIC: 12345-1234567-1, Event: 1, Duty: Security (exists) |
| **Expected Result** | Record "Rejected" - "Duplicate: Same duty in same event" |
| **Status** | - |

#### TC-VAL-004: Different Duties Same Event
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-004 |
| **Type** | Positive (Flagged) |
| **Priority** | High |
| **Module** | Validation |
| **Description** | Verify different duty same event flagging |
| **Preconditions** | Person has one duty in event |
| **Test Steps** | 1. Upload same CNIC with different duty for same event |
| **Test Data** | CNIC: 12345-1234567-1, Event: 1, Duty: Water Services (new) |
| **Expected Result** | Record marked as "Discrepant" with warning |
| **Status** | - |

#### TC-VAL-005: Assigned by Multiple Teams
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-005 |
| **Type** | Positive (Flagged) |
| **Priority** | High |
| **Module** | Validation |
| **Description** | Verify multiple team assignment flagging |
| **Preconditions** | Person assigned by Local Council |
| **Test Steps** | 1. ITREB uploads same CNIC |
| **Test Data** | CNIC: 12345-1234567-1, Source: ITREB (was Local Council) |
| **Expected Result** | Record marked as "Discrepant" - "Assigned by multiple sources" |
| **Status** | - |

#### TC-VAL-006: Multiple Events Assignment
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-006 |
| **Type** | Positive (Flagged) |
| **Priority** | Medium |
| **Module** | Validation |
| **Description** | Verify multiple event assignment flagging |
| **Preconditions** | Person assigned to Event 1 |
| **Test Steps** | 1. Upload same CNIC for Event 2 |
| **Test Data** | CNIC: 12345-1234567-1, Event: 2 |
| **Expected Result** | Record marked as "Discrepant" but allowed (flagged for visibility) |
| **Status** | - |

### 5.3 Data Integrity

#### TC-VAL-007: Invalid Event Number
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-007 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Validation |
| **Description** | Verify invalid event number |
| **Preconditions** | NA |
| **Test Steps** | 1. Upload record with event number 10 |
| **Test Data** | Event: 10 (only 1-9 exist) |
| **Expected Result** | Record rejected - "Invalid event number" |
| **Status** | - |

#### TC-VAL-008: Invalid Access Level
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-008 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Validation |
| **Description** | Verify invalid access level |
| **Preconditions** | NA |
| **Test Steps** | 1. Upload record with access level 6 |
| **Test Data** | Access Level: 6 (only 1-5 exist) |
| **Expected Result** | Record rejected - "Invalid access level" |
| **Status** | - |

#### TC-VAL-009: Duty Type Access Level Mismatch
| Field | Value |
|-------|-------|
| **Test ID** | TC-VAL-009 |
| **Type** | Negative |
| **Priority** | Medium |
| **Module** | Validation |
| **Description** | Verify duty matches access level |
| **Preconditions** | NA |
| **Test Steps** | 1. Upload record with Reciter duty but Pandal access |
| **Test Data** | Duty: Reciter, Access: 2 (Pandal) |
| **Expected Result** | Record rejected - "Duty type mismatch with access level" |
| **Status** | - |

---

## 6. API Integration Tests

### 6.1 API Response Tests

#### TC-API-001: API Timeout Handling
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-001 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | API |
| **Description** | Verify timeout error handling |
| **Preconditions** | Slow network |
| **Test Steps** | 1. Simulate slow network<br>2. Make API call |
| **Test Data** | NA |
| **Expected Result** | Proper timeout error message displayed |
| **Status** | - |

#### TC-API-002: Network Offline
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-002 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | API |
| **Description** | Verify offline handling |
| **Preconditions** | Device offline |
| **Test Steps** | 1. Turn off network<br>2. Try to load data |
| **Test Data** | NA |
| **Expected Result** | Error message "No internet connection" |
| **Status** | - |

#### TC-API-003: Server Error 500
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-003 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | API |
| **Description** | Verify server error handling |
| **Preconditions** | Server returns 500 |
| **Test Steps** | 1. Trigger server error |
| **Test Data** | NA |
| **Expected Result** | Error message "Server error, please try again" |
| **Status** | - |

#### TC-API-004: Unauthorized 401
| Field | Value |
|-------|-------|
| **Test ID** | TC-API-004 |
| **Type** | Negative |
| **Priority** | High |
| **Module** | API |
| **Description** | Verify token expiry handling |
| **Preconditions** | Token expired |
| **Test Steps** | 1. Make API call with expired token |
| **Test Data** | NA |
| **Expected Result** | Redirect to login screen |
| **Status** | - |

---

## 📊 Test Summary

| Module | Total Tests | Critical | High | Medium |
|--------|-------------|----------|------|--------|
| Authentication | 6 | 0 | 4 | 2 |
| Data Upload | 7 | 1 | 4 | 2 |
| Approval | 5 | 1 | 3 | 1 |
| Submission | 4 | 2 | 1 | 1 |
| Checker Review | 3 | 0 | 2 | 1 |
| Badge Printing | 6 | 2 | 3 | 1 |
| Dispatch | 5 | 1 | 3 | 1 |
| Dashboard | 6 | 0 | 3 | 3 |
| Validation Rules | 9 | 3 | 4 | 2 |
| API Integration | 4 | 0 | 4 | 0 |
| **Total** | **55** | **10** | **31** | **14** |

---

## ✅ Test Execution Template

| Test ID | Executed By | Date | Result | Defect ID | Comments |
|---------|-------------|------|--------|-----------|----------|
| | | | Pass/Fail | | |

---

**Document Version:** 1.0  
**Last Updated:** April 16, 2026  
**Prepared By:** QA Team
