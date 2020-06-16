<?php

namespace Capco\AppBundle;

final class CapcoAppBundleEvents
{
    const OPINION_VOTE_CHANGED = 'capco.opinion_vote_changed';
    const ABSTRACT_VOTE_CHANGED = 'capco.abstract_vote_changed';
    const COMMENT_CHANGED = 'capco.comment_changed';

    const DECISION_APPROVED = 'capco.decision_approved';
    const DECISION_REFUSED = 'capco.decision_refused';
}
