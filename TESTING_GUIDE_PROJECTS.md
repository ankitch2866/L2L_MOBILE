# Testing Guide - Projects Module Fixes

## Quick Test Scenarios

### Scenario 1: Edit from List Screen
**Steps**:
1. Open Projects List
2. Click Edit icon on any project card
3. Make changes (e.g., change project name)
4. Click "Update Project"

**Expected Result**:
- ✅ Returns to Projects List
- ✅ Updated project shows new data in the list
- ✅ Success message appears
- ✅ No white screen or freezing

---

### Scenario 2: Edit from View Screen (CRITICAL FIX)
**Steps**:
1. Open Projects List
2. Click on a project card to view details
3. Click "Edit Project" button
4. Make changes (e.g., change company name)
5. Click "Update Project"

**Expected Result**:
- ✅ Returns to Project Details (View) screen
- ✅ View screen shows updated data immediately
- ✅ No need to go back and re-enter
- ✅ Success message appears
- ✅ No white screen

**Before Fix**: Would show white screen or stale data
**After Fix**: Shows updated data immediately

---

### Scenario 3: Multiple Edits in Sequence
**Steps**:
1. View a project (Details screen)
2. Edit → Change name → Save
3. Immediately Edit again → Change address → Save
4. Edit once more → Change landmark → Save

**Expected Result**:
- ✅ Each edit returns to View screen
- ✅ Each edit shows updated data
- ✅ No navigation issues
- ✅ No data loss

---

### Scenario 4: Image Display - Project WITH Image
**Steps**:
1. Create/Edit a project with an image (via web or backend)
2. View the project in mobile app

**Expected Result**:
- ✅ Image displays in "Project Signature" section
- ✅ Image loads correctly
- ✅ Image is properly sized and centered

**Check Console**: Should NOT see image load errors

---

### Scenario 5: Image Display - Project WITHOUT Image
**Steps**:
1. View a project that has no image

**Expected Result**:
- ✅ "Project Signature" section is visible
- ✅ Shows placeholder with icon
- ✅ Shows message: "No signature image available"
- ✅ No broken image icon
- ✅ Clean, professional appearance

**Before Fix**: Section might not appear at all
**After Fix**: Always shows section with placeholder

---

### Scenario 6: Image Display - Invalid Image URL
**Steps**:
1. Manually set a project's image URL to invalid value in database
2. View the project in mobile app

**Expected Result**:
- ✅ Image fails to load gracefully
- ✅ Console shows error log (for debugging)
- ✅ App doesn't crash
- ✅ User sees placeholder or broken image

**Check Console**: Should see "Image load error: ..." message

---

### Scenario 7: Image Picker (UI Only)
**Steps**:
1. Go to Add Project or Edit Project screen
2. Tap on "Tap to upload sign image" area
3. Select an image from gallery
4. See image preview
5. Click X button to remove image

**Expected Result**:
- ✅ Image picker opens
- ✅ Selected image shows in preview
- ✅ Remove button works
- ✅ Can select different image

**Known Limitation**: 
- ⚠️ Image is NOT uploaded to backend yet
- ⚠️ After saving, image will not persist
- ⚠️ This is expected behavior (not implemented yet)

---

## Edge Cases to Test

### Edge Case 1: Rapid Navigation
**Steps**:
1. View → Edit → Save → Edit → Save → Edit → Save (quickly)

**Expected**: Should handle gracefully without crashes

---

### Edge Case 2: Network Issues
**Steps**:
1. Turn off WiFi/mobile data
2. Try to view a project with image

**Expected**: 
- Image fails to load
- Shows placeholder or error
- App doesn't crash

---

### Edge Case 3: Backend Server Down
**Steps**:
1. Stop backend server
2. Try to view project details

**Expected**:
- Loading indicator appears
- Error message shows
- App doesn't crash

---

## Debugging Tips

### If Images Don't Load:

1. **Check Backend Server**:
   ```bash
   # Make sure backend is running
   cd L2L_EPR_BACK_V2
   npm start
   ```

2. **Check Image URL Format**:
   - Should be: `http://192.168.1.27:5002/uploads/sign_images/filename.jpg`
   - NOT: `localhost` or `127.0.0.1`

3. **Check Console Logs**:
   - Look for "Image load error: ..." messages
   - Check network requests in React Native debugger

4. **Verify Backend Serves Images**:
   - Open browser
   - Navigate to: `http://192.168.1.27:5002/uploads/sign_images/test.jpg`
   - Should see image or 404 (not connection error)

5. **Check Database**:
   ```sql
   SELECT project_id, project_name, sign_image_name 
   FROM project 
   WHERE sign_image_name IS NOT NULL;
   ```

---

### If Navigation Doesn't Work:

1. **Check Console for Errors**:
   - Look for Redux errors
   - Look for navigation errors

2. **Verify Redux State**:
   - Use Redux DevTools
   - Check if `currentProject` is updated

3. **Check Network Requests**:
   - Verify API calls are successful
   - Check response data structure

---

## Performance Checks

### What to Monitor:

1. **Navigation Speed**:
   - Should be instant (< 100ms)
   - No lag when going back to View screen

2. **Data Refresh**:
   - Should fetch data only when needed
   - No unnecessary API calls

3. **Image Loading**:
   - Images should load within 1-2 seconds
   - No blocking of UI during load

4. **Memory Usage**:
   - No memory leaks from images
   - App should remain responsive

---

## Success Criteria

### All Tests Pass When:

- ✅ No white screens anywhere
- ✅ All navigation flows work smoothly
- ✅ Data always shows latest values
- ✅ Images display or show placeholder
- ✅ No app crashes
- ✅ Error messages are clear and helpful
- ✅ Performance is acceptable
- ✅ User experience is smooth

---

## Known Issues / Limitations

1. **Image Upload Not Implemented**:
   - Can select images in UI
   - Images are NOT saved to backend
   - Will be implemented in next phase

2. **Image Caching**:
   - Images are fetched every time
   - No local caching yet
   - May be slow on poor network

3. **Image Compression**:
   - No compression before upload
   - Large images may be slow
   - Will be added later

---

## Next Phase Testing

When image upload is implemented, test:

1. Upload new image in Add Project
2. Upload new image in Edit Project
3. Replace existing image
4. Remove image (set to null)
5. Upload large images (> 5MB)
6. Upload different formats (PNG, JPG, JPEG)
7. Upload invalid files (should reject)
8. Network failure during upload
9. Backend storage limits
10. Image URL generation and serving
