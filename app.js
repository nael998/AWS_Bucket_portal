// Initialize AWS SDK with your credentials
AWS.config.update({
    accessKeyId: 'AKIAYUW6OP7VMIDTZ6FS',
    secretAccessKey: 'TEZWFR0ImzrBDpPbFlRSNI3C8xFdsR6XsFFxAJhn',
    region: 'us-west-1'
});

// Create an S3 instance
var s3 = new AWS.S3();


function uploadToS3(file, data) {
    if (!file)
        throw new Error('Parameter [file] must be provided');

    const extensionIndex = file.lastIndexOf('.');
    const extension = extensionIndex !== -1 ? file.slice(extensionIndex + 1) : '/Files';
    const filename = extensionIndex !== -1 ? file.slice(0, extensionIndex) : file;
    const fileLocation = `Files/${extension}/${filename}`;

    console.log(`Extension: ${extension}`);
    console.log(`Filename: ${filename}`);
    let params = {
        Bucket: 'sortfiles.com',
        Key: fileLocation,
        Body: data
    };
    s3.upload(params, function (err, data) {
        if (err) {
            console.log('Error uploading file:', err);
            alert("Fail")
        } else {
            console.log('File uploaded successfully:', data);
          //listFiles();
          alert("Successful")
        }
    });

};


// Function to upload a file to S3
function uploadFile(file) {
    if (file) {
        uploadToS3(file.name, file);
    } else {
        console.log('No file selected or data type specified.');
    }
}

// Function to handle the drag-and-drop functionality
function handleDrop(e) {
    e.preventDefault();
    var files = e.dataTransfer.files;

    if (files.length > 0) {
        uploadFile(files[0]);
    }
}

// Function to handle the file input change (optional, if you want to keep the file input)
function handleFileInput() {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];
    uploadFile(file);
}

// Event listeners for the drop zone and file input (if you want to keep it)
var dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
});

dropZone.addEventListener('drop', handleDrop);

var fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', handleFileInput);


// Function to list files in the S3 bucket
function listFiles() {
    var params = {
        Bucket: 'sortfiles.com'
    };

    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log('Error listing files:', err);
        } else {
            displayFiles(data.Contents);
        }
    });
}

// Functions to display files 
function displayFiles(files) {
    var fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    files.sort(function(a, b) {
        var nameA = a.Key.toUpperCase(); // ignore upper and lowercase
        var nameB = b.Key.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    files.forEach(function (file) {
        var listItem = document.createElement('li');
        listItem.textContent = file.Key;

        // Append download link to each file
        var downloadLink = document.createElement('a');
        downloadLink.href = s3.getSignedUrl('getObject', {
            Bucket: 'sortfiles.com',
            Key: file.Key
        });
        downloadLink.textContent = 'Download';
        listItem.appendChild(downloadLink);
        fileList.appendChild(listItem);
       
    });

    // Enable sorting using jQuery UI
    $('#fileList').sortable();

    // Add button to sort files alphabetically
    var sortButton = document.createElement('button');
    sortButton.textContent = 'Sort Alphabetically';
    sortButton.onclick = function() {
        var list = $('#fileList');
        var listItems = list.children('li').get();
        listItems.sort(function(a, b) {
            return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
        });
        $.each(listItems, function(idx, itm) { list.append(itm); });
    };
    fileList.parentNode.insertBefore(sortButton, fileList);

    // Add search bar to filter files
    var searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.placeholder = 'Search files...';
    searchBar.onkeyup = function() {
        var filter = searchBar.value.toUpperCase();
        var list = $('#fileList');
        var listItems = list.children('li').get();
        listItems.forEach(function(item) {
            var text = item.textContent.toUpperCase();
            if (text.indexOf(filter) > -1) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    };
    fileList.parentNode.insertBefore(searchBar, fileList);
}
