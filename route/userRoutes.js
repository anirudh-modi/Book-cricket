var express = require('express');

var router = express.Router();

var userJs = require('../serverJs/user');

router.put('/register', function(req, res) {
    if (req.body)
    {
        var emailId = req.body.emailId;

        /**
         * creating user detail
         */
        var userDetail = {
            'emailId': emailId
        };

        if (req.body.username) {
            userDetail.username = req.body.username;
        }

        userJs.create(userDetail, function(err)
        {
                if (err)
                {
                    return res.json({ status: 'fail', errMsg: err.errMsg });
                } else
                {
                    res.json({ status: 'ok' });
                }
            });
    }
    else
    {
        res.json({ status: 'fail', errMsg: '@noBody' });
    }
});


module.exports = router;
