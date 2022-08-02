const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-t from-yellow-400 to-pink-500">
      <div className="max-w-md w-full relative">
        <div className="shadow rounded-md py-9 px-9 space-y-4 my-8 bg-white bg-opacity-25">
          <h2 className="text-center text-3xl text-gray-800">登录</h2>
          <div className="flex flex-col items-start">
            <label htmlFor="username" className="text-sm text-gray-900">
              用户名
            </label>
            <input
              type="text"
              id="username"
              className="appearance-none block transition-all duration-300 rounded border border-gray-300 text-sm w-full py-2 px-2  my-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-500"
            />
          </div>

          <div className="flex flex-col items-start">
            <label htmlFor="password" className="text-sm text-gray-900">
              密码
            </label>
            <input
              type="password"
              id="password"
              className="appearance-none block transition-all duration-300 rounded border border-gray-300 text-sm w-full py-2 px-2  my-2 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-500"
            />
          </div>
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 rounded transition-all focus:ring-indigo-500 border-gray-300"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              记住我
            </label>
          </div>
          <div>
            <button className="block rounded w-full py-2 transition-all bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500">
              登 录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
