export interface CheckResponse {
  auth_info: {
    auth: number;
    userId: number;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      patronymic: string;
      fullName: string;
      initials: string;
      login: string;
      birthday: string;
      groupName: string;
      photoUrl: string;
      userId: number;
    };
  };
}

export interface UserDetailsResponse {
  id: number;
  manId: number;
  man: {
    id: number;
    lastname: string;
    firstname: string;
    patronymic: string;
    gender: string;
    birthDate: string;
    email: string;
    telephone: string;
    login: string;
  };
  recordBook: string;
  course: number;
  groupId: number;
  sourceFinancingStr: string;
  isContract: boolean;
  isBudget: boolean;
}
