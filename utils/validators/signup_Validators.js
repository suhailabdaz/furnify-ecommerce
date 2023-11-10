const nameValid=(name)=>{
    nameRegex=/^[A-Za-z]+$/
    return name.length >1 && nameRegex.test(name)
}

const emailValid=(email)=>{
    const emailRegex=/^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    return emailRegex.test(email)
}

const phoneValid=(phone)=>{
    phoneRegex=/^[0-9]{10}$/
    return phoneRegex.test(phone)
}

const passwordValid=(password)=>{
    const length=/^.{8,}$/
    const uppercase=/[A-Z]/
    const lowercase=/[a-z]/
    const number=/\d/
    const specialcharecter=/[!@#$%^&*(),.?":{}|<>]/

    const haslength=length.test(password)
    const hasuppercase=uppercase.test(password)
    const haslowercase=lowercase.test(password)
    const hasnumber=number.test(password)
    const hasspecialcharecter=specialcharecter.test(password)
    return haslength && hasuppercase && haslowercase && hasnumber && hasspecialcharecter
}

const confirmpasswordValid=(confirmpassword,password)=>{
    return confirmpassword==password
}

module.exports={
    nameValid,
    emailValid,
    phoneValid,
    passwordValid,
    confirmpasswordValid
}