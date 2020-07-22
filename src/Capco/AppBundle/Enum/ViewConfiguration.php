<?php

namespace Capco\AppBundle\Enum;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Exception\ViewConfigurationException;

class ViewConfiguration
{
    public const GRID = 'grid';
    public const LIST = 'list';
    public const MAP = 'map';

    public const ALL = [self::GRID, self::LIST, self::MAP];

    public static function checkProposalForm(ProposalForm $proposalForm): void
    {
        if (
            !$proposalForm->isGridViewEnabled() &&
            !$proposalForm->isListViewEnabled() &&
            !$proposalForm->isMapViewEnabled()
        ) {
            throw new ViewConfigurationException(ViewConfigurationException::NO_VIEW_ACTIVE);
        }
    }

    public static function updateStepsFromProposal(ProposalForm $proposalForm): void
    {
        if ($proposalForm->getStep()) {
            self::updateOneStepFromItsProposal($proposalForm, $proposalForm->getStep());
        }
        if ($proposalForm->getProject()) {
            foreach ($proposalForm->getProject()->getSteps() as $projectStep) {
                if ($projectStep->getStep() instanceof CollectStep || $projectStep->getStep() instanceof SelectionStep) {
                    self::updateOneStepFromItsProposal($proposalForm, $projectStep->getStep());
                }
            }
        }
    }

    private static function updateOneStepFromItsProposal(ProposalForm $proposalForm, AbstractStep $step): void
    {
        if (
            (self::GRID === $step->getMainView() && !$proposalForm->isGridViewEnabled()) ||
            (self::LIST === $step->getMainView() && !$proposalForm->isListViewEnabled()) ||
            (self::MAP === $step->getMainView() && !$proposalForm->isMapViewEnabled())
        ) {
            if ($proposalForm->isGridViewEnabled()) {
                $step->setMainView(self::GRID);
            } elseif ($proposalForm->isListViewEnabled()) {
                $step->setMainView(self::LIST);
            } elseif ($proposalForm->isMapViewEnabled()) {
                $step->setMainView(self::MAP);
            }
        }
    }
}
