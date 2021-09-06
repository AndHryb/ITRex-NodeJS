import patientController from '../../src/api/patient/controller/PatientController.js';
import authController from '../../src/api/auth/controller/AuthController.js';
import { STATUSES, EMAIL_IS_EXIST, WRONG_PASSWORD_MESSAGE, WRONG_EMAIL_MESSAGE } from '../../src/constants.js';

const { userService } = authController;
const { jwtService } = authController;

describe('auth controller have to', () => {

    test('create new user', async () => {
        userService.createNewUser = jest.fn((pass) => pass);

        const res = await authController.createNewUser('abc');

        expect(res.status).toBe(STATUSES.Created);
        expect(res.value.password).toBe('abc');
        expect(userService.createNewUser).toBeCalled();
    });

    test('sign up new patient', async () => {
        patientController.isExist = jest.fn(() => false);
        authController.createNewUser = jest.fn(() => ({
            status: STATUSES.Created, value: {
                password: '123',
                userID: '1',
            }
        }));
        patientController.addPatient = jest.fn(({ userID, password, id, email, name }) => ({ userID, name, email, id }));

        const res = await authController.signUpNewPatient({ name: 'dima', email: 'email' });

        expect(res.status).toBe(STATUSES.Created);
        expect(res.value.name).toBe('dima');
        expect(res.value.email).toBe('email');
        expect(res.value.userID).toBe('1');
    });

    test('sign in patient', async () => {
        patientController.getPatient = jest.fn(() => ({ status: 200, value: { userID: '1' } }));
        userService.isPasswordMatches = jest.fn(() => true);
        jwtService.createJwtToken = jest.fn(() => 'token');

        const res = await authController.signInUser({ userID: '1' });
        
        expect(res.status).toBe(200);
        expect(res.value).toBe('token');
        expect(patientController.getPatient).toBeCalled();
        expect(userService.isPasswordMatches).toBeCalled();
        expect(jwtService.createJwtToken).toBeCalled();
    });

    test('check token', async () => {
        jwtService.checkJwtToken = jest.fn(() => ({userID: '1'}));

        const res = await authController.checkToken('token');
        
        expect(jwtService.checkJwtToken).toBeCalled();
        expect(res.status).toBe(200);
        expect(res.value.userID).toBe('1');
    });

    test('failed with check token', async () => {
        jwtService.checkJwtToken = jest.fn(() => ({userID: '1'}));

        const res = await authController.checkToken(null);
        
        expect(jwtService.checkJwtToken).toBeCalledTimes(0);
        expect(res.status).toBe(403);
        expect(res.value).toBeInstanceOf(Error);
    });

    test('failed with sign-in user with wrong password', async () => {
        patientController.getPatient = jest.fn(() => ({ status: 200, value: { userID: '1' } }));
        userService.isPasswordMatches = jest.fn(() => false);
        jwtService.createJwtToken = jest.fn(() => 'token');

        const res = await authController.signInUser({ userID: '1' });

        expect(res.value).toBeInstanceOf(Error);
        expect(res.value.message).toBe(WRONG_PASSWORD_MESSAGE);
        expect(res.status).toBe(STATUSES.Forbidden);
        expect(patientController.getPatient).toBeCalled();
        expect(userService.isPasswordMatches).toBeCalled();
        expect(jwtService.createJwtToken).toBeCalledTimes(0);
    });

    test('failed with sign-in user with wrong email', async () => {
        patientController.getPatient = jest.fn(() => ({ status: 404, value: new Error('not-found') }));
        userService.isPasswordMatches = jest.fn(() => false);
        jwtService.createJwtToken = jest.fn(() => 'token');

        const res = await authController.signInUser({ userID: '1' });

        expect(res.value).toBeInstanceOf(Error);
        expect(res.value.message).toBe(WRONG_EMAIL_MESSAGE);
        expect(res.status).toBe(STATUSES.Forbidden);
        expect(patientController.getPatient).toBeCalled();
        expect(userService.isPasswordMatches).toBeCalledTimes(0);
        expect(jwtService.createJwtToken).toBeCalledTimes(0);
    });

    test('failed with sign-up new user', async () => {
        patientController.isExist = jest.fn(() => true);
        authController.createNewUser = jest.fn(() => ({
            status: STATUSES.Created, value: {
                password: '123',
                userID: '1',
            }
        }));
        patientController.addPatient = jest.fn(({ userID, password, id, email, name }) => ({ userID, name, email, id }));

        const res = await authController.signUpNewPatient({ name: 'dima', email: 'email' });

        expect(res.status).toBe(STATUSES.BadRequest);
        expect(res.value).toBeInstanceOf(Error);
        expect(res.value.message).toBe(EMAIL_IS_EXIST);
        expect(patientController.isExist).toBeCalled();
        expect(authController.createNewUser).toBeCalledTimes(0);
        expect(patientController.addPatient).toBeCalledTimes(0);
    });
})