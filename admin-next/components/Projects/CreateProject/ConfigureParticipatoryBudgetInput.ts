import moment from "moment";
import type {
    PreConfigureProjectInput,
} from '@relay/PreConfigureProjectMutation.graphql';
import {IntlShape} from "react-intl";

const DATE_FORMAT = 'YYYY-MM-DD H:mm:ss';
const stepsDates = {
    collectStep: {
        startAt: () => moment().format(DATE_FORMAT),
        endAt: () => moment().add(2, 'M').format(DATE_FORMAT),
    },
    selectionStep1: {
        startAt: () => stepsDates.collectStep.endAt(),
        endAt: () => moment(stepsDates.selectionStep1.startAt()).add(3, 'M').format(DATE_FORMAT),
    },
    selectionStep2: {
        startAt: () => stepsDates.selectionStep1.endAt(),
        endAt: () => moment(stepsDates.selectionStep2.startAt()).add(1, 'M').format(DATE_FORMAT),
    },
    selectionStep3: {
        startAt: () => stepsDates.selectionStep2.endAt(),
        endAt: () => null,
    },
}

type Params = {
    projectTitle: string
    authors: Array<string>
    intl: IntlShape
}

const getParticipatoryBudgetInput = ({ projectTitle, authors, intl }: Params): PreConfigureProjectInput => {

    const proposalFormTitle = `${projectTitle} - ${intl.formatMessage({id: 'proposal-form'})}`;
    const questionnaireTitle = `${projectTitle} - ${intl.formatMessage({id: 'export.option.analysis-form'})}`;

    const input: PreConfigureProjectInput = {
        "questionnaires": [
            {
                "title": questionnaireTitle,
                "description": intl.formatMessage({id: 'please-answer-the-various-questions-in-order-to-analyse-the-project'}),
                "questions": [
                    {
                        "question": {
                            "title": intl.formatMessage({id: 'selection-criteria'}),
                            "private": false,
                            "required": false,
                            "jumps": [],
                            "alwaysJumpDestinationQuestion": null,
                            "type": "section",
                            "level": 0
                        }
                    },
                    {
                        "question": {
                            "title": intl.formatMessage({id: 'is-the-project-compliant'}),
                            "private": false,
                            "required": false,
                            "type": "radio",
                            "choices": [
                                {
                                    "title": intl.formatMessage({id: 'global.yes'}),
                                },
                                {
                                    "title": intl.formatMessage({id: 'global.no'}),
                                }
                            ],
                            "jumps": [
                                {
                                    "conditions": [
                                        {
                                            "operator": "IS",
                                            "question": intl.formatMessage({id: 'is-the-project-compliant'}),
                                            "value": intl.formatMessage({id: 'global.no'})
                                        }
                                    ],
                                    "origin": intl.formatMessage({id: 'is-the-project-compliant'}),
                                    "destination": intl.formatMessage({id: 'global.why'})
                                }
                            ],
                            "alwaysJumpDestinationQuestion": intl.formatMessage({id: "estimated-cost-of-the-project"}),
                        }
                    },
                    {
                        "question": {
                            "title": intl.formatMessage({id: 'global.why'}),
                            "private": false,
                            "required": false,
                            "jumps": [],
                            "alwaysJumpDestinationQuestion": null,
                            "type": "text",
                        }
                    },
                    {
                        "question": {
                            "title": intl.formatMessage({id: "estimated-cost-of-the-project" }),
                            "private": false,
                            "required": false,
                            "jumps": [],
                            "alwaysJumpDestinationQuestion": null,
                            "type": "textarea",
                        }
                    }
                ]
            }
        ],
        "proposalForms": [
            {
                "title": proposalFormTitle,
                "usingCategories": true,
                "usingAddress": true,
                "usingDescription": true,
                "isGridViewEnabled": true,
                "isMapViewEnabled": true,
                "objectType": "PROPOSAL",
                "usingFacebook": false,
                "usingWebPage": false,
                "usingTwitter": false,
                "usingInstagram": false,
                "usingYoutube": false,
                "usingLinkedIn": false,
                "usingIllustration": true,
            }
        ],
        "project": {
            "title": `${projectTitle}`,
            authors,
            "projectType": "participatory-budgeting",
            "themes": [],
            "districts": [],
            "metaDescription": null,
            "publishedAt": moment().format(DATE_FORMAT),
            "visibility": "ME",
            "opinionCanBeFollowed": true,
            "isExternal": false,
            "steps": [
                {
                    "body": `<p>- ${intl.formatMessage({id: "what-is-a-bp" })}</p><p>- ${intl.formatMessage({id: "schedule-approach" })}</p><p>- ${intl.formatMessage({id: "rules" })}</p>`,
                    "title": intl.formatMessage({id: "presentation-of-your-project" }),
                    "label": intl.formatMessage({id: "presentation-of-your-project" }),
                    "isEnabled": true,
                    "requirements": [],
                    "type": "PRESENTATION"
                },
                {
                    "body": `<p>- ${intl.formatMessage({id: "reminder-of-how-it-works" })}</p><p>- ${intl.formatMessage({id: "criteria-for-ideas" })}</p><p>- ${intl.formatMessage({id: "example-of-an-eligible-non-eligible-project" })}</p>`,
                    "title": intl.formatMessage({id: "submit-your-projects" }),
                    "startAt": stepsDates.collectStep.startAt(),
                    "endAt": stepsDates.collectStep.endAt(),
                    "label": intl.formatMessage({id: "project-submission" }),
                    "isEnabled": true,
                    "defaultSort": "RANDOM",
                    "mainView": "GRID",
                    "proposalForm": proposalFormTitle,
                    "private": false,
                    "requirements": [],
                    "type": "COLLECT",
                    "voteType": "DISABLED",
                },
                {
                    "label": intl.formatMessage({id: "proposal_form.admin.evaluation" }),
                    "body": null,
                    "title": intl.formatMessage({id: "project-analysis" }),
                    "startAt": stepsDates.selectionStep1.startAt(),
                    "endAt": stepsDates.selectionStep1.endAt(),
                    "isEnabled": true,
                    "mainView": "GRID",
                    "requirements": [],
                    "statuses": [
                        {
                            "color": "WARNING",
                            "name": intl.formatMessage({id: "under-analysis" })
                        },
                        {
                            "color": "SUCCESS",
                            "name": intl.formatMessage({id: "put-to-the-vote" })
                        },
                        {
                            "color": "DANGER",
                            "name": intl.formatMessage({id: "not-achievable" })
                        },
                        {
                            "color": "DANGER",
                            "name": intl.formatMessage({id: "out-of-scope" })
                        },
                        {
                            "color": "DANGER",
                            "name": intl.formatMessage({id: "already-planned" })
                        },
                        {
                            "color": "PRIMARY",
                            "name": intl.formatMessage({id: "merged" })
                        }
                    ],
                    "defaultStatus": intl.formatMessage({id: "under-analysis" }),
                    "defaultSort": "RANDOM",
                    "type": "SELECTION",
                    "voteType": "DISABLED",
                },
                {
                    "label": intl.formatMessage({id: "vote-capitalize" }),
                    "title": intl.formatMessage({id: "vote-for-your-favourite-projects" }),
                    "startAt": stepsDates.selectionStep2.startAt(),
                    "endAt": stepsDates.selectionStep2.endAt(),
                    "isEnabled": true,
                    "mainView": "GRID",
                    "requirements": [
                        {
                            "type": "FIRSTNAME"
                        },
                        {
                            "type": "LASTNAME"
                        },
                        {
                            "type": "PHONE"
                        },
                        {
                            "type": "DATE_OF_BIRTH"
                        },
                        {
                            "type": "POSTAL_ADDRESS"
                        },
                        {
                            "type": "CHECKBOX",
                            "label": intl.formatMessage({id: "i-certify-that-i-am-over-16-years-old" })
                        }
                    ],
                    "statuses": [
                        {
                            "color": "PRIMARY",
                            "name": intl.formatMessage({id: "put-to-the-vote" })
                        }
                    ],
                    "defaultSort": "RANDOM",
                    "defaultStatus": intl.formatMessage({id: "put-to-the-vote" }),
                    "votesLimit": 3,
                    "allowAuthorsToAddNews": true,
                    "type": "SELECTION",
                    "voteType": "SIMPLE",
                },
                {
                    "label": intl.formatMessage({id: "award-winning-projects" }),
                    "title": intl.formatMessage({id: "list-of-selected-projects" }),
                    "startAt": stepsDates.selectionStep3.startAt(),
                    "endAt": stepsDates.selectionStep3.endAt(),
                    "isEnabled": true,
                    "mainView": "GRID",
                    "requirements": [],
                    "allowAuthorsToAddNews": true,
                    "statuses": [
                        {
                            "color": "SUCCESS",
                            "name": intl.formatMessage({id: "completed-project" })
                        },
                        {
                            "color": "WARNING",
                            "name": intl.formatMessage({id: "project-in-progress" })
                        },
                        {
                            "color": "WARNING",
                            "name": intl.formatMessage({id: "project-under-study" })
                        },
                        {
                            "color": "PRIMARY",
                            "name": intl.formatMessage({id: "award-winning-projects" })
                        }
                    ],
                    "defaultSort": "RANDOM",
                    "allowingProgressSteps": true,
                    "defaultStatus": intl.formatMessage({id: "award-winning-projects" }),
                    "type": "SELECTION",
                    "voteType": "DISABLED",
                }
            ],
            "locale": null,
            "archived": false
        },
        "analysisForm": {
            "proposalFormId": proposalFormTitle,
            "evaluationFormId": questionnaireTitle,
            "analysisStepId": intl.formatMessage({id: "project-analysis" }),
            "effectiveDate": stepsDates.selectionStep1.endAt(),
            "moveToSelectionStepId": intl.formatMessage({id: "vote-for-your-favourite-projects" }),
            "selectionStepStatusId": intl.formatMessage({id: "put-to-the-vote" }),
            "unfavourableStatuses": [intl.formatMessage({id: "not-achievable" }), intl.formatMessage({id: "out-of-scope" }), intl.formatMessage({id: "already-planned" })],
            "favourableStatus": intl.formatMessage({id: "put-to-the-vote" }),
            "costEstimationEnabled": false,
        }
    }

    return input;
}


export { getParticipatoryBudgetInput }