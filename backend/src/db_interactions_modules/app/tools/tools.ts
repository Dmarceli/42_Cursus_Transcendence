function check_valid_number(number_to_test: number){
    if(number_to_test > 2147483647 || number_to_test < 0)
        return false;
    return true;
}
export default check_valid_number;