pragma solidity 0.4.23;


contract PoaCrowdsale {
  // buy tokens
  function buy()
    external
    payable
    checkTimeout
    atStage(Stages.EthFunding)
    isBuyWhitelisted
    returns (bool)
  {
    // Prevent FiatFunding addresses from contributing to funding to keep total supply legit
    if (isFiatInvestor(msg.sender)) {
      return false;
    }

    // prevent case where buying after reaching fundingGoal results in buyer
    // earning money on a buy
    if (weiToFiatCents(fundedAmountInWei) > fundingGoalInCents) {
      enterStage(Stages.Pending);
      if (msg.value > 0) {
        msg.sender.transfer(msg.value);
      }
      return false;
    }

    // get current funded amount + sent value in cents
    // with most current rate available
    uint256 _currentFundedCents = weiToFiatCents(fundedAmountInWei.add(msg.value))
      .add(fundedAmountInCentsDuringFiatFunding);
    // check if balance has met funding goal to move on to Pending
    if (_currentFundedCents < fundingGoalInCents) {
      // give a range due to fun fun integer division
      if (fundingGoalInCents.sub(_currentFundedCents) > 1) {
        // continue sale if more than 1 cent from goal in fiat
        return buyAndContinueFunding(msg.value);
      } else {
        // finish sale if within 1 cent of goal in fiat
        // no refunds for overpayment should be given
        return buyAndEndFunding(false);
      }
    } else {
      // finish sale, we are now over the funding goal
      // a refund for overpaid amount should be given
      return buyAndEndFunding(true);
    }
  }

  // buy and continue funding process (when funding goal not met)
  function buyAndContinueFunding(uint256 _payAmount)
    internal
    returns (bool)
  {
    // save this for later in case needing to reclaim
    investmentAmountPerUserInWei[msg.sender] = investmentAmountPerUserInWei[msg.sender]
      .add(_payAmount);
    // increment the funded amount
    fundedAmountInWei = fundedAmountInWei.add(_payAmount);

    getContractAddress("Logger").call(
      bytes4(keccak256("logBuyEvent(address,uint256)")), msg.sender, _payAmount
    );

    return true;
  }

  // buy and finish funding process (when funding goal met)
  function buyAndEndFunding(bool _shouldRefund)
    internal
    returns (bool)
  {
    // let the world know that the token is in Pending Stage
    enterStage(Stages.Pending);
    uint256 _refundAmount = _shouldRefund ?
      fundedAmountInWei.add(msg.value).sub(fiatCentsToWei(fundingGoalInCents)) :
      0;
    // transfer refund amount back to user
    msg.sender.transfer(_refundAmount);
    // actual Ξ amount to buy after refund
    uint256 _payAmount = msg.value.sub(_refundAmount);
    buyAndContinueFunding(_payAmount);

    return true;
  }
}