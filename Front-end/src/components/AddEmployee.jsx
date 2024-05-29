import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Box,
  MenuItem,
  TextField,
  Select,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AddEmployee = () => {
  const [clientCode, setClientCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [designation, setDesignation] = useState("");
  const [designations, setDesignations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workShift, setWorkShift] = useState("");
  const [bloodgroup, setBloodGroup] = useState("");
  const [employeeType, setEmployeeType] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [bankProof, setBankProof] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const designationResponse = await axios.get(
        "http://localhost:8080/api/glb/get-designation"
      );
      if (designationResponse.data.success) {
        setDesignations(designationResponse.data.data);
      } else {
        console.error(
          "Failed to fetch designations:",
          designationResponse.data.message
        );
      }

      const locationResponse = await axios.get(
        "http://localhost:8080/api/glb/get-location"
      );
      if (locationResponse.data.success) {
        setLocations(locationResponse.data.data);
      } else {
        console.error(
          "Failed to fetch locations:",
          locationResponse.data.message
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFileChange = async (file, e) => {
    const files = e.target.files;
    setAadharFront([files[0]]);
    console.log(file);
  
    const formdata = new FormData();
    formdata.append("image", files[0]);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };


  await fetch("http://localhost:8080/api/common/upload", requestOptions)
  .then((response) => {
    // Ensure the response is JSON
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // parse JSON
  })
  .then((data) => {
    // Log the data to understand its structure
    console.log("Response data:", data);
    
    if (!data || !data.imageUrl) {
      throw new Error('Invalid response data');
    }

    if(file === 'aadharFront'){
      setAadharFront(data.imageUrl);
    } else if(file === 'aadharBack'){
      setAadharBack(data.imageUrl);
    } else if(file === 'panCard'){
      setPanCard(data.imageUrl);
    }else if(file === 'bankProof'){
      setBankProof(data.imageUrl);
    }else {
      setProfilePicture(data.imageUrl);
    }
    console.log("Image URL:", data.imageUrl);
  })
  .catch((error) => console.error("Error:", error));
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const data = {
      empID: "",
      locID: 1,
      cID: 1,
      name: fullName,
      mobile: mobileNumber,
      DOB: dateOfBirth,
      designation: designation,
      workShift: workShift,
      bloodgroup: bloodgroup,
      empType: employeeType,
      aadharFront: aadharFront,
      aadharBack: aadharBack,
      pan: panCard,
      bankAcctNo: accountNumber,
      beneficiaryName: beneficiaryName,
      ifsc: ifscCode,
      bankProof: bankProof,
      profilePic: profilePicture,
      jdata: {
        ismgr: 1,
      },
    };

    console.log("Data to be sent:", data);

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:8080/api/ems/register-employee",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };

    axios
      .request(config)
      .then((response) => {
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    navigate("/success");
  };

  

  const isFormComplete =
    workLocation &&
    clientCode &&
    fullName &&
    mobileNumber &&
    dateOfBirth &&
    designation &&
    employeeType &&
    workShift &&
    bloodgroup &&
    accountNumber &&
    beneficiaryName &&
    ifscCode &&
    aadharFront &&
    aadharBack &&
    panCard &&
    bankProof &&
    profilePicture;

  const validateMobileNumber = (value) => {
    return /^\d{10}$/.test(value);
  };

  const validateName = (value) => {
    return /^[A-Za-z\s]+$/.test(value);
  };

  const validateAccountNumber = (value) => {
    return /^\d+$/.test(value);
  };

  const validateBeneficiaryName = (value) => {
    return /^[A-Za-z\s.]+$/.test(value);
  };

  const validateIFSCCode = (value) => {
    return /^[A-Za-z0-9]+$/.test(value);
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#fafafa",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      <Typography
        variant="h4"
        component="p"
        sx={{ textAlign: "center", mt: 5 }}
      >
        Add Employee
      </Typography>
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "70%", lg: "60%" },
          bgcolor: "white",
          margin: "auto",
          mt: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: "10px",
        }}
      >
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Work Location
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Work Hub
            </MenuItem>
            {locations.map((location) => (
              <MenuItem key={location.locID} value={location.workLocation}>
                {location.workLocation}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Client Code
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={clientCode}
            onChange={(e) => setClientCode(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Client Code
            </MenuItem>
            <MenuItem value="department1">code 1</MenuItem>
            <MenuItem value="department2">code 2</MenuItem>
            <MenuItem value="department3">code 3</MenuItem>
            <MenuItem value="department4">code 4</MenuItem>
          </Select>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Full Name
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={!validateName(fullName)}
          helperText={!validateName(fullName) && "Please enter a valid name"}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Mobile Number
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Enter mobile number"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          error={!validateMobileNumber(mobileNumber)}
          helperText={
            !validateMobileNumber(mobileNumber) &&
            "Please enter a valid 10-digit mobile number"
          }
          sx={{ mb: 2 }}
        />
        <Box sx={{ width: "100%", mt: 3, mb: 2 }}>
          <Divider sx={{ bgcolor: "lightgray" }}></Divider>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Date of Birth
        </Typography>
        <TextField
          fullWidth
          type="date"
          variant="outlined"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Designation
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Designation
            </MenuItem>
            {designations.map((item) => (
              <MenuItem key={item.Designation} value={item.Designation}>
                {item.Designation}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Employee Type
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Employee Type
            </MenuItem>
            <MenuItem value="On Role">On Role</MenuItem>
            <MenuItem value="Off Role">Off Role</MenuItem>
            <MenuItem value="Adhoc">Adhoc</MenuItem>
          </Select>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Work Shift
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={workShift}
            onChange={(e) => setWorkShift(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Work Shift
            </MenuItem>
            <MenuItem value="Day Shift">Day Shift</MenuItem>
            <MenuItem value="Night Shift">Night Shift</MenuItem>
          </Select>
        </Box>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Blood Group
        </Typography>
        <Box sx={{ width: "100%" }}>
          <Select
            fullWidth
            value={bloodgroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            sx={{ mb: 2 }}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Blood Group
            </MenuItem>
            <MenuItem value="A+">A+</MenuItem>
            <MenuItem value="A-">A-</MenuItem>
            <MenuItem value="B+">B+</MenuItem>
            <MenuItem value="B-">B-</MenuItem>
            <MenuItem value="O+">O+</MenuItem>
            <MenuItem value="O-">O-</MenuItem>
            <MenuItem value="AB+">AB+</MenuItem>
            <MenuItem value="AB-">AB-</MenuItem>
          </Select>
        </Box>
      </Box>

      <Typography
        variant="h4"
        component="p"
        sx={{ textAlign: "center", mt: 5 }}
      >
        Upload Kyc
      </Typography>
      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "70%", lg: "60%" },
          bgcolor: "white",
          margin: "auto",
          mt: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: "10px",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upload Aadhar Card Front (PDF, PNG, JPG)
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                color: "black",
                backgroundColor: "#2BC2B9",
                fontSize: "16px",
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg"
                onChange={(e)=>handleFileChange('aadharFront', e)}
              />
            </Button>
            {aadharFront && (
              <Typography variant="body2" sx={{ color: "green" }}>
                {aadharFront.name} uploaded
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upload Aadhar Card Back (PDF, PNG, JPG)
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                color: "black",
                backgroundColor: "#2BC2B9",
                fontSize: "16px",
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg"
                onChange={(e)=>handleFileChange('aadharBack', e)}
              />
            </Button>
            {aadharBack && (
              <Typography variant="body2" sx={{ color: "green" }}>
                {aadharBack.name} uploaded
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upload PAN Card (PDF, PNG, JPG)
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                color: "black",
                backgroundColor: "#2BC2B9",
                fontSize: "16px",
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg"
                onChange={(e)=>handleFileChange('panCard', e)}
              />
            </Button>
            {panCard && (
              <Typography variant="body2" sx={{ color: "green" }}>
                {panCard.name} uploaded
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upload Profile Picture (PDF, PNG, JPG)
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                color: "black",
                backgroundColor: "#2BC2B9",
                fontSize: "16px",
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg"
                onChange={(e)=>handleFileChange('profilePicture', e)}
              />
            </Button>
            {profilePicture && (
              <Typography variant="body2" sx={{ color: "green" }}>
                {profilePicture.name} uploaded
              </Typography>
            )}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Upload Bank Proof (PDF, PNG, JPG)
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                mb: 2,
                color: "black",
                backgroundColor: "#2BC2B9",
                fontSize: "16px",
              }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.png,.jpg"
                onChange={(e)=>handleFileChange('bankProof', e)}
              />
            </Button>
            {bankProof && (
              <Typography variant="body2" sx={{ color: "green" }}>
                {bankProof.name} uploaded
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "90%", sm: "80%", md: "70%", lg: "60%" },
          bgcolor: "white",
          margin: "auto",
          mt: 4,
          p: 3,
          boxShadow: 3,
          borderRadius: "10px",
        }}
      >
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Account Number
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="A/C Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          error={!validateAccountNumber(accountNumber)}
          helperText={
            !validateAccountNumber(accountNumber) &&
            "Please enter a valid account number"
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Beneficiary Name
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Full name as per Bank"
          value={beneficiaryName}
          onChange={(e) => setBeneficiaryName(e.target.value)}
          error={!validateBeneficiaryName(beneficiaryName)}
          helperText={
            !validateBeneficiaryName(beneficiaryName) &&
            "Please enter a valid beneficiary name"
          }
          sx={{ mb: 2 }}
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          IFSC Code
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="IFSC"
          value={ifscCode}
          onChange={(e) => setIfscCode(e.target.value)}
          error={!validateIFSCCode(ifscCode)}
          helperText={
            !validateIFSCCode(ifscCode) && "Please enter a valid IFSC Code"
          }
          sx={{ mb: 2 }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          sx={{ width: { xs: "100%", sm: "auto" } }}
          onClick={handleSubmit}
          disabled={!isFormComplete}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default AddEmployee;

