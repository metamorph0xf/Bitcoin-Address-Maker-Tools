$(document).ready(function () {
  $("#aes256pass, #aes256pass_confirm").on("input", function () {
    $("#aes256passStatus").addClass("hidden");
  });

  $("#brainwallet").on("input", function () {
    $("#brainwalletStatus").addClass("hidden");
  });

  $("#newKeysBtn").click(function () {
    let hasError = false;
    let s = null;

    $("#brainwalletStatus").addClass("hidden");
    $("#aes256passStatus").addClass("hidden");

    if ($("#newBrainwallet").is(":checked")) {
      const seed = $("#brainwallet").val().trim();
      if (seed === "") {
        $("#brainwalletStatus")
          .removeClass("hidden")
          .find(".alert")
          .html(
            `Can't be empty. Please input the Custom Seed or Brain Wallet!`
          );
        hasError = true;
      } else {
        s = seed;
      }
    }

    if ($("#encryptKey").is(":checked")) {
      const pass = $("#aes256pass").val();
      const confirm = $("#aes256pass_confirm").val();

      if (pass === "" || confirm === "") {
        $("#aes256passStatus")
          .removeClass("hidden")
          .find(".alert")
          .html(`Password can't be empty!`);
        hasError = true;
      } else if (pass !== confirm) {
        $("#aes256passStatus")
          .removeClass("hidden")
          .find(".alert")
          .html(`Passwords do not match, please try again!`);
        hasError = true;
      }
    }
    if (hasError) return;

    $("#newBitcoinAddress").val("");
    $("#newPubKey").val("");
    $("#newPrivKey").val("");
    $("#newPrivKeyEnc").val("");

    metamorph.compressed = $("#newCompressed").is(":checked");
    var meta = metamorph.newKeys(s);

    $("#newBitcoinAddress").val(meta.address);
    $("#newPubKey").val(meta.pubkey);

    if ($("#encryptKey").is(":checked")) {
      const encrypted = CryptoJS.AES.encrypt(
        meta.wif,
        $("#aes256pass").val()
      ).toString();

      $("#aes256wifkey").removeClass("hidden");
      $("#newPrivKeyEnc").val(encrypted);
      $("#wifContainer").addClass("hidden");
    } else {
      $("#newPrivKey").val(meta.wif);
      $("#wifContainer").removeClass("hidden");
      $("#aes256wifkey").addClass("hidden");
    }
  });

  $("#newPaperwalletBtn").click(function () {
    const address = $("#newBitcoinAddress").val().trim();
    const pubKey = $("#newPubKey").val().trim();
    const privKey = $("#newPrivKey").val().trim();
    const encPrivKey = $("#newPrivKeyEnc").val().trim();

    if (address === "" || pubKey === "") {
      alert(
        "address and public key is not available yet. please generate first!"
      );
      return;
    }

    let keyType = "";
    let keyValue = "";

    if (privKey !== "") {
      keyType = "Private Key (WIF) Keep it Secret!";
      keyValue = privKey;
    } else if (encPrivKey !== "") {
      keyType = "Encrypted (AES-256 Algorithm) Private key";
      keyValue = encPrivKey;
    } else {
      alert("There is no Private key (WIF) available to print.");
      return;
    }

    const paperwallet = window.open();
    paperwallet.document.write("<h2>Bitcoin Address Paper</h2><hr>");

    paperwallet.document.write(`
    <div style="margin-top: 5px; margin-bottom: 5px">
      <div><h3 style="margin-top: 0">Address (P2PKH)</h3></div>
      <div style="text-align: center;">
        <div id="qraddress"></div>
        <p>${address}</p>
      </div>
    </div><hr>
  `);

    paperwallet.document.write(`
    <div style="margin-top: 5px; margin-bottom: 5px">
      <div><h3 style="margin-top: 0">Public Key</h3></div>
      <div style="text-align: center;">
        <div id="qrpubkey"></div>
        <p>${pubKey}</p>
      </div>
    </div><hr>
  `);

    paperwallet.document.write(`
    <div style="margin-top: 5px; margin-bottom: 5px">
      <div><h3 style="margin-top: 0">${keyType}</h3></div>
      <div style="text-align: center;">
        <div id="qrprivkey"></div>
        <p>${keyValue}</p>
      </div>
    </div>
  `);

    paperwallet.document.close();
    paperwallet.focus();

    new QRCode(paperwallet.document.getElementById("qraddress"), {
      text: address,
      width: 125,
      height: 125,
    });

    new QRCode(paperwallet.document.getElementById("qrpubkey"), {
      text: pubKey,
      width: 125,
      height: 125,
    });

    new QRCode(paperwallet.document.getElementById("qrprivkey"), {
      text: keyValue,
      width: 125,
      height: 125,
    });

    paperwallet.print();
    paperwallet.close();
  });

  $("#newBrainwallet").change(function () {
    if ($(this).is(":checked")) {
      $("#brainwalletWrapper").removeClass("hidden");
    } else {
      $("#brainwalletWrapper").addClass("hidden");
      $("#brainwallet").val("");
      $("#brainwalletStatus").addClass("hidden");
    }
  });

  $("#encryptKey").on("change", function () {
    if ($(this).is(":checked")) {
      $("#aes256passform").removeClass("hidden");
      $("#aes256wifkey").removeClass("hidden");
      $("#wifContainer").addClass("hidden");
    } else {
      $("#aes256passform, #aes256passStatus").addClass("hidden");
      $("#aes256wifkey").addClass("hidden");
      $("#wifContainer").removeClass("hidden");
    }
  });

  $(".qrcodeBtn").click(function () {
    $("#qrcode").html("");
    var thisbtn = $(this).parent().parent();
    var qrstr = false;
    var ta = $("textarea", thisbtn);

    if (ta.length > 0) {
      var w =
        (screen.availWidth > screen.availHeight
          ? screen.availWidth
          : screen.availHeight) / 3;
      var qrcode = new QRCode("qrcode", { width: w, height: w });
      qrstr = $(ta).val();
      if (qrstr.length > 1024) {
        $("#qrcode").html(
          "<p>Sorry the data is too long for the QR generator.</p>"
        );
      }
    } else {
      var qrcode = new QRCode("qrcode");
      qrstr = "bitcoin:" + $(".address", thisbtn).val();
    }

    if (qrstr) {
      qrcode.makeCode(qrstr);
    }
  });

  $(".showKey").click(function () {
    const input = $(this).closest(".input-group").find("input");
    const icon = $(this).find("i");
    const isHidden = input.attr("type") === "password";

    if (isHidden) {
      input.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
      $(this).attr("title", "Hide Private Key");
    } else {
      input.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      $(this).attr("title", "Show Private Key");
    }
  });

  $('[data-toggle="tooltip"]').tooltip();

  $(".toggle-password").on("click", function () {
    const targetInput = $($(this).data("target"));
    const icon = $(this).find("i");

    if (targetInput.attr("type") === "password") {
      targetInput.attr("type", "text");
      icon.removeClass("fa-eye").addClass("fa-eye-slash");
      $(this)
        .attr("title", "Hide Password")
        .tooltip("fixTitle")
        .tooltip("show");
    } else {
      targetInput.attr("type", "password");
      icon.removeClass("fa-eye-slash").addClass("fa-eye");
      $(this)
        .attr("title", "Show Password")
        .tooltip("fixTitle")
        .tooltip("show");
    }
  });

  $(".copyKey").on("click", function () {
    const $input = $(this).closest(".input-group").find("input");

    if ($input.val()) {
      $input.prop("type", "text");
      $input.select();
      document.execCommand("copy");
      $input.prop("type", "password");

      $(this).attr("title", "Copied!").tooltip("show");

      setTimeout(() => {
        $(this).attr("title", "Copy Private key (WIF)").tooltip("hide");
      }, 1500);
    }
  });

  $("#decryptBtn").on("click", function () {
    const encrypted = $("#wifEncrypted").val().trim();
    const password = $("#passAes256").val().trim();

    if (!encrypted || !password) {
      $("#wifStatus")
        .removeClass("alert-success alert-danger")
        .addClass("alert-warning")
        .text("Please input Encrypted Private key (WIF) and Password!");
      $("#outputWif").val("");
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, password);
      const wif = decrypted.toString(CryptoJS.enc.Utf8);

      if (!wif || wif.length === 0) {
        $("#wifStatus")
          .removeClass("alert-success alert-warning")
          .addClass("alert-danger")
          .text(
            "Incorrect Encrypted Private key (WIF) or Password. Please check again!"
          );
        $("#outputWif").val("");
      } else {
        $("#outputWif").val(wif);
        $("#wifStatus")
          .removeClass("alert-danger alert-warning")
          .addClass("alert-success")
          .css("text-align", "justify")
          .text(
            "Encrypted Private key (WIF) successfully Decrypting. no need show the Private key (WIF), just copy and paste it on your wallet to import the address"
          );
      }
    } catch (e) {
      $("#wifStatus")
        .removeClass("alert-success alert-warning")
        .addClass("alert-danger")
        .text("Error when Decrypting.");
      $("#outputWif").val("");
    }
  });

  function openModal(modalId) {
    $(modalId).modal({
      backdrop: "static",
      keyboard: false,
    });
  }

  $("#modalDecryptingLink").on("click", function (e) {
    e.preventDefault();
    openModal("#modalDecrypting");
  });

  $(".qrcodeBtn").on("click", function () {
    openModal("#modalQrcode");
  });
});
