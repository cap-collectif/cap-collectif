<?php

namespace Capco\AppBundle;

final class CapcoAppBundleEvents
{
    public const OPINION_VOTE_CHANGED = 'capco.opinion_vote_changed';
    public const ABSTRACT_VOTE_CHANGED = 'capco.abstract_vote_changed';
    public const COMMENT_CHANGED = 'capco.comment_changed';

    public const DECISION_APPROVED = 'capco.decision_approved';
    public const DECISION_REFUSED = 'capco.decision_refused';
}
