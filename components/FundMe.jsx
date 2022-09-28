import { useEffect, useState } from "react";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { abi, contractAddresses } from "../constants/index";
import { ethers } from "ethers";
import { useNotification } from "@web3uikit/core";
import { Bell, Cross } from "@web3uikit/icons";
export const FundMe = () => {
  const { chainId: chainID } = useMoralis();
  const chainId = parseInt(chainID);
  const [totalFunders, setTotalFunders] = useState("0");
  const [minimumFunds, setMinimumFunds] = useState("0");
  const [withdrawFlag, setWithdrawFlag] = useState(false);
  const [totalFunds, setTotalFunds] = useState("0");
  const [allFunders, setAllFunders] = useState([]);
  const dispatch = useNotification();
  const fundMeAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const {
    runContractFunction: fund,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "fund",
    params: {},
    msgValue: minimumFunds,
  });

  const { runContractFunction: withdraw } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "withdraw",
    params: {},
  });

  const { runContractFunction: getAllAddresses } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "getAllAddresses",
    params: {},
  });

  const { runContractFunction: getNumberOfPeople } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "getNumberOfPeople",
    params: {},
  });

  const { runContractFunction: getTotalFunds } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "getTotalFunds",
    params: {},
  });

  const { runContractFunction: getMinimumFunds } = useWeb3Contract({
    abi: abi,
    contractAddress: fundMeAddress,
    functionName: "getMinimumFunds",
    params: {},
  });

  const updateUI = async () => {
    if (fundMeAddress) {
      try {
        const numberOfFunders = (await getNumberOfPeople()).toString();
        const allAddresses = await getAllAddresses();
        const total = (await getTotalFunds()).toString();
        const min = (await getMinimumFunds()).toString();
        const totalAmount = ethers.utils.formatEther(total);
        setTotalFunds(totalAmount);
        setTotalFunders(numberOfFunders);
        setAllFunders(allAddresses);
        setMinimumFunds(min);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleSuccess = async (tx) => {
    await tx.wait(1);
    updateUI();
    handleNewNotification(tx);
  };

  const handleNewNotification = (tx) => {
    dispatch({
      type: "info",
      message: "Transaction Complete",
      title: "Tx Notification",
      position: "topR",
      icon: <Bell fontSize={"50px"} />,
    });
  };

  const handleErrorNotification = (error) => {
    let message;
    try {
      if (error.data.data.message.includes("FundMe__NotOwner")) {
        message = "You are not owner";
      }

      if (
        error.data.data.message.includes("FundMe__NotEnoughFundsInContract")
      ) {
        message = "Not enough funds";
      }
      dispatch({
        type: "error",
        message: message || error.code,
        title: "Error Notification",
        position: "topR",
        icon: <Cross fontSize={"20px"} />,
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    updateUI();
  }, [fundMeAddress]);
  return (
    <div className=" inline-block p-20">
      {fundMeAddress ? (
        <>
          <div className="heading text-center">Fund Me</div>
          <div>
            Minimum funds you can donate is{" "}
            {ethers.utils.formatEther(minimumFunds)} ETH
          </div>
          <div>Total people who have donated till now: {totalFunders}</div>
          <div>Total funds: {totalFunds} ETH</div>
          <div className="flex py-6 justify-center">
            <button
              className="submit mx-3 bg-blue-500 hover:bg-blue-700 p-3 rounded text-white font-bold"
              onClick={async () => {
                await fund({
                  onSuccess: handleSuccess,
                  onError: handleErrorNotification,
                });
              }}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                <div>Fund Me</div>
              )}
            </button>
            <button
              className="submit mx-3 bg-blue-500 hover:bg-blue-700 p-3 rounded text-white font-bold"
              onClick={async () => {
                setWithdrawFlag(true);
                await withdraw({
                  onSuccess: handleSuccess,
                  onError: handleErrorNotification,
                });
                setWithdrawFlag(false);
              }}
              disabled={isLoading || isFetching}
            >
              {withdrawFlag ? (
                <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
              ) : (
                <div>Withdraw</div>
              )}
            </button>
          </div>
          {allFunders.length > 0 ? (
            <table className="my-4">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                {allFunders.map((address, index) => {
                  return (
                    <tr key={index}>
                      <td className="px-2">{index + 1}</td>
                      <td className="px-2">{address}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div></div>
          )}
        </>
      ) : (
        <div>No Contract Detected</div>
      )}
    </div>
  );
};
