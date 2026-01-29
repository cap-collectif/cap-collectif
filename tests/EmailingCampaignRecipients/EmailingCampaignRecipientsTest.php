<?php

namespace Capco\Tests\EmailingCampaignRecipients;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Recipient\RecipientsProvider;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class EmailingCampaignRecipientsTest extends KernelTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        self::bootKernel();
    }

    /**
     * @dataProvider campaignDataProvider
     *
     * @param array<int, array{username: string, email: string}> $expectedRecipients
     */
    public function testCampaign(string $campaignId, array $expectedRecipients): void
    {
        $container = static::getContainer();

        $campaign = $container
            ->get(EmailingCampaignRepository::class)
            ->find($campaignId)
        ;
        $this->assertInstanceOf(EmailingCampaign::class, $campaign);

        $recipientsData = [];
        $recipientsPage = $container->get(RecipientsProvider::class)->getRecipients($campaign);
        foreach ($recipientsPage as $recipient) {
            $recipientsData[] = [
                'username' => $recipient->getUsername(),
                'email' => $recipient->getEmail(),
            ];
        }

        $this->assertEquals(
            $this->sortRecipients($expectedRecipients),
            $this->sortRecipients($recipientsData)
        );
    }

    /**
     * @return array<string, array{0: string, 1: array<int, array{username: string, email: string}>}>
     */
    public function campaignDataProvider(): array
    {
        return [
            'campaign with mailing list' => [
                'CampaignWithMailingList',
                $this->mailingListExpectedRecipients(),
            ],
            'campaign with all registred users' => [
                'CampaignWithAllRegistered',
                $this->allRegistredExpectedRecipients(),
            ],
            'campaign with user group' => [
                'CampaignWithUserGroup',
                $this->userGroupExpectedRecipients(),
            ],
            'campaign with project (collect vote)' => [
                'CampaignWithProjectCollectVote',
                $this->projectCollectVoteExpectedRecipients(),
            ],
            'campaign with project (selection vote)' => [
                'CampaignWithProjectSelectionVote',
                $this->projectSelectionVoteExpectedRecipients(),
            ],
            'campaign with project (consultation)' => [
                'CampaignWithProjectConsultation',
                $this->projectConsultationExpectedRecipients(),
            ],
        ];
    }

    /**
     * @param array{username: string, email: string} $recipientA
     * @param array{username: string, email: string} $recipientB
     */
    private function compareRecipients(array $recipientA, array $recipientB): int
    {
        if ($recipientA['email'] === $recipientB['email']) {
            return $recipientA['username'] <=> $recipientB['username'];
        }

        return $recipientA['email'] <=> $recipientB['email'];
    }

    /**
     * @param array<int, array{username: string, email: string}> $recipients
     *
     * @return array<int, array{username: string, email: string}>
     */
    private function sortRecipients(array $recipients): array
    {
        $sortedRecipients = array_map(function (array $recipient) {
            ksort($recipient);

            return $recipient;
        }, $recipients);
        usort($sortedRecipients, [$this, 'compareRecipients']);

        return $sortedRecipients;
    }

    /**
     * @return array<int, array{username: string, email: string}>
     */
    private function mailingListExpectedRecipients(): array
    {
        return [
            [
                'username' => 'Vince',
                'email' => 'vincent@cap-collectif.com',
            ],
            [
                'username' => 'lbrunet',
                'email' => 'lbrunet@cap-collectif.com',
            ],
            [
                'username' => 'mauriau',
                'email' => 'maxime.auriau@cap-collectif.com',
            ],
            [
                'username' => 'spyl',
                'email' => 'aurelien@cap-collectif.com',
            ],
            [
                'username' => 'user18',
                'email' => 'user18@cap-collectif.com',
            ],
            [
                'username' => 'user19',
                'email' => 'user19@cap-collectif.com',
            ],
            [
                'username' => 'user20',
                'email' => 'user20@cap-collectif.com',
            ],
            [
                'username' => 'user21',
                'email' => 'user21@cap-collectif.com',
            ],
            [
                'username' => 'user22',
                'email' => 'user22@cap-collectif.com',
            ],
            [
                'username' => 'user23',
                'email' => 'user23@cap-collectif.com',
            ],
            [
                'username' => 'user24',
                'email' => 'user24@cap-collectif.com',
            ],
            [
                'username' => 'user25',
                'email' => 'user25@cap-collectif.com',
            ],
            [
                'username' => 'user26',
                'email' => 'user26@cap-collectif.com',
            ],
            [
                'username' => 'user27',
                'email' => 'user27@cap-collectif.com',
            ],
            [
                'username' => 'user28',
                'email' => 'user28@cap-collectif.com',
            ],
            [
                'username' => 'user29',
                'email' => 'user29@cap-collectif.com',
            ],
            [
                'username' => 'user30',
                'email' => 'user30@cap-collectif.com',
            ],
            [
                'username' => 'user31',
                'email' => 'user31@cap-collectif.com',
            ],
            [
                'username' => 'user32',
                'email' => 'user32@cap-collectif.com',
            ],
            [
                'username' => 'user33',
                'email' => 'user33@cap-collectif.com',
            ],
            [
                'username' => 'user34',
                'email' => 'user34@cap-collectif.com',
            ],
            [
                'username' => 'user35',
                'email' => 'user35@cap-collectif.com',
            ],
            [
                'username' => 'user36',
                'email' => 'user36@cap-collectif.com',
            ],
            [
                'username' => 'user37',
                'email' => 'user37@cap-collectif.com',
            ],
            [
                'username' => 'user38',
                'email' => 'user38@cap-collectif.com',
            ],
            [
                'username' => 'user39',
                'email' => 'user39@cap-collectif.com',
            ],
            [
                'username' => 'user40',
                'email' => 'user40@cap-collectif.com',
            ],
            [
                'username' => 'user41',
                'email' => 'user41@cap-collectif.com',
            ],
            [
                'username' => 'user42',
                'email' => 'user42@cap-collectif.com',
            ],
            [
                'username' => 'user43',
                'email' => 'user43@cap-collectif.com',
            ],
            [
                'username' => 'user44',
                'email' => 'user44@cap-collectif.com',
            ],
            [
                'username' => 'user45',
                'email' => 'user45@cap-collectif.com',
            ],
            [
                'username' => 'user46',
                'email' => 'user46@cap-collectif.com',
            ],
            [
                'username' => 'user47',
                'email' => 'user47@cap-collectif.com',
            ],
            [
                'username' => 'user48',
                'email' => 'user48@cap-collectif.com',
            ],
            [
                'username' => 'user49',
                'email' => 'user49@cap-collectif.com',
            ],
            [
                'username' => 'user50',
                'email' => 'user50@cap-collectif.com',
            ],
        ];
    }

    /**
     * @return array<int, array{username: ?string, email: string}>
     */
    private function allRegistredExpectedRecipients(): array
    {
        return [
            [
                'username' => 'emailingadmin',
                'email' => 'emailing.admin@fake-email.com',
            ],
            [
                'username' => 'lbrunet',
                'email' => 'lbrunet@cap-collectif.com',
            ],
            [
                'username' => 'mauriau',
                'email' => 'maxime.auriau@cap-collectif.com',
            ],
            [
                'username' => 'myriam',
                'email' => 'myriam@cap-collectif.com',
            ],
            [
                'username' => 'spyl',
                'email' => 'aurelien@cap-collectif.com',
            ],
            [
                'username' => 'Vince',
                'email' => 'vincent@cap-collectif.com',
            ],
            [
                'username' => null,
                'email' => 'amelis.campagne@cap-collectif.com',
            ],
            [
                'username' => null,
                'email' => 'emile.campanil@cap-collectif.com',
            ],
            [
                'username' => null,
                'email' => 'emilie.compte-panille@cap-collectif.com',
            ],
            [
                'username' => 'user101',
                'email' => 'user101@cap-collectif.com',
            ],
            [
                'username' => 'user102',
                'email' => 'user102@cap-collectif.com',
            ],
            [
                'username' => 'user103',
                'email' => 'user103@cap-collectif.com',
            ],
            [
                'username' => 'user104',
                'email' => 'user104@cap-collectif.com',
            ],
            [
                'username' => 'user105',
                'email' => 'user105@cap-collectif.com',
            ],
            [
                'username' => 'user106',
                'email' => 'user106@cap-collectif.com',
            ],
            [
                'username' => 'user107',
                'email' => 'user107@cap-collectif.com',
            ],
            [
                'username' => 'user108',
                'email' => 'user108@cap-collectif.com',
            ],
            [
                'username' => 'user109',
                'email' => 'user109@cap-collectif.com',
            ],
            [
                'username' => 'user11',
                'email' => 'user11@cap-collectif.com',
            ],
            [
                'username' => 'user110',
                'email' => 'user110@cap-collectif.com',
            ],
            [
                'username' => 'user111',
                'email' => 'user111@cap-collectif.com',
            ],
            [
                'username' => 'user112',
                'email' => 'user112@cap-collectif.com',
            ],
            [
                'username' => 'user113',
                'email' => 'user113@cap-collectif.com',
            ],
            [
                'username' => 'user114',
                'email' => 'user114@cap-collectif.com',
            ],
            [
                'username' => 'user115',
                'email' => 'user115@cap-collectif.com',
            ],
            [
                'username' => 'user116',
                'email' => 'user116@cap-collectif.com',
            ],
            [
                'username' => 'user117',
                'email' => 'user117@cap-collectif.com',
            ],
            [
                'username' => 'user118',
                'email' => 'user118@cap-collectif.com',
            ],
            [
                'username' => 'user119',
                'email' => 'user119@cap-collectif.com',
            ],
            [
                'username' => 'user12',
                'email' => 'user12@cap-collectif.com',
            ],
            [
                'username' => 'user120',
                'email' => 'user120@cap-collectif.com',
            ],
            [
                'username' => 'user121',
                'email' => 'user121@cap-collectif.com',
            ],
            [
                'username' => 'user122',
                'email' => 'user122@cap-collectif.com',
            ],
            [
                'username' => 'user123',
                'email' => 'user123@cap-collectif.com',
            ],
            [
                'username' => 'user124',
                'email' => 'user124@cap-collectif.com',
            ],
            [
                'username' => 'user125',
                'email' => 'user125@cap-collectif.com',
            ],
            [
                'username' => 'user126',
                'email' => 'user126@cap-collectif.com',
            ],
            [
                'username' => 'user127',
                'email' => 'user127@cap-collectif.com',
            ],
            [
                'username' => 'user128',
                'email' => 'user128@cap-collectif.com',
            ],
            [
                'username' => 'user129',
                'email' => 'user129@cap-collectif.com',
            ],
            [
                'username' => 'user13',
                'email' => 'user13@cap-collectif.com',
            ],
            [
                'username' => 'user130',
                'email' => 'user130@cap-collectif.com',
            ],
            [
                'username' => 'user131',
                'email' => 'user131@cap-collectif.com',
            ],
            [
                'username' => 'user132',
                'email' => 'user132@cap-collectif.com',
            ],
            [
                'username' => 'user133',
                'email' => 'user133@cap-collectif.com',
            ],
            [
                'username' => 'user134',
                'email' => 'user134@cap-collectif.com',
            ],
            [
                'username' => 'user135',
                'email' => 'user135@cap-collectif.com',
            ],
            [
                'username' => 'user136',
                'email' => 'user136@cap-collectif.com',
            ],
            [
                'username' => 'user137',
                'email' => 'user137@cap-collectif.com',
            ],
            [
                'username' => 'user138',
                'email' => 'user138@cap-collectif.com',
            ],
            [
                'username' => 'user139',
                'email' => 'user139@cap-collectif.com',
            ],
            [
                'username' => 'user14',
                'email' => 'user14@cap-collectif.com',
            ],
            [
                'username' => 'user140',
                'email' => 'user140@cap-collectif.com',
            ],
            [
                'username' => 'user141',
                'email' => 'user141@cap-collectif.com',
            ],
            [
                'username' => 'user142',
                'email' => 'user142@cap-collectif.com',
            ],
            [
                'username' => 'user143',
                'email' => 'user143@cap-collectif.com',
            ],
            [
                'username' => 'user144',
                'email' => 'user144@cap-collectif.com',
            ],
            [
                'username' => 'user145',
                'email' => 'user145@cap-collectif.com',
            ],
            [
                'username' => 'user146',
                'email' => 'user146@cap-collectif.com',
            ],
            [
                'username' => 'user147',
                'email' => 'user147@cap-collectif.com',
            ],
            [
                'username' => 'user148',
                'email' => 'user148@cap-collectif.com',
            ],
            [
                'username' => 'user149',
                'email' => 'user149@cap-collectif.com',
            ],
            [
                'username' => 'user15',
                'email' => 'user15@cap-collectif.com',
            ],
            [
                'username' => 'user150',
                'email' => 'user150@cap-collectif.com',
            ],
            [
                'username' => 'user151',
                'email' => 'user151@cap-collectif.com',
            ],
            [
                'username' => 'user152',
                'email' => 'user152@cap-collectif.com',
            ],
            [
                'username' => 'user153',
                'email' => 'user153@cap-collectif.com',
            ],
            [
                'username' => 'user154',
                'email' => 'user154@cap-collectif.com',
            ],
            [
                'username' => 'user155',
                'email' => 'user155@cap-collectif.com',
            ],
            [
                'username' => 'user156',
                'email' => 'user156@cap-collectif.com',
            ],
            [
                'username' => 'user157',
                'email' => 'user157@cap-collectif.com',
            ],
            [
                'username' => 'user158',
                'email' => 'user158@cap-collectif.com',
            ],
            [
                'username' => 'user159',
                'email' => 'user159@cap-collectif.com',
            ],
            [
                'username' => 'user16',
                'email' => 'user16@cap-collectif.com',
            ],
            [
                'username' => 'user160',
                'email' => 'user160@cap-collectif.com',
            ],
            [
                'username' => 'user161',
                'email' => 'user161@cap-collectif.com',
            ],
            [
                'username' => 'user162',
                'email' => 'user162@cap-collectif.com',
            ],
            [
                'username' => 'user163',
                'email' => 'user163@cap-collectif.com',
            ],
            [
                'username' => 'user164',
                'email' => 'user164@cap-collectif.com',
            ],
            [
                'username' => 'user165',
                'email' => 'user165@cap-collectif.com',
            ],
            [
                'username' => 'user166',
                'email' => 'user166@cap-collectif.com',
            ],
            [
                'username' => 'user167',
                'email' => 'user167@cap-collectif.com',
            ],
            [
                'username' => 'user168',
                'email' => 'user168@cap-collectif.com',
            ],
            [
                'username' => 'user169',
                'email' => 'user169@cap-collectif.com',
            ],
            [
                'username' => 'user17',
                'email' => 'user17@cap-collectif.com',
            ],
            [
                'username' => 'user170',
                'email' => 'user170@cap-collectif.com',
            ],
            [
                'username' => 'user171',
                'email' => 'user171@cap-collectif.com',
            ],
            [
                'username' => 'user172',
                'email' => 'user172@cap-collectif.com',
            ],
            [
                'username' => 'user173',
                'email' => 'user173@cap-collectif.com',
            ],
            [
                'username' => 'user174',
                'email' => 'user174@cap-collectif.com',
            ],
            [
                'username' => 'user175',
                'email' => 'user175@cap-collectif.com',
            ],
            [
                'username' => 'user176',
                'email' => 'user176@cap-collectif.com',
            ],
            [
                'username' => 'user177',
                'email' => 'user177@cap-collectif.com',
            ],
            [
                'username' => 'user178',
                'email' => 'user178@cap-collectif.com',
            ],
            [
                'username' => 'user179',
                'email' => 'user179@cap-collectif.com',
            ],
            [
                'username' => 'user18',
                'email' => 'user18@cap-collectif.com',
            ],
            [
                'username' => 'user180',
                'email' => 'user180@cap-collectif.com',
            ],
            [
                'username' => 'user181',
                'email' => 'user181@cap-collectif.com',
            ],
            [
                'username' => 'user182',
                'email' => 'user182@cap-collectif.com',
            ],
            [
                'username' => 'user183',
                'email' => 'user183@cap-collectif.com',
            ],
            [
                'username' => 'user184',
                'email' => 'user184@cap-collectif.com',
            ],
            [
                'username' => 'user185',
                'email' => 'user185@cap-collectif.com',
            ],
            [
                'username' => 'user186',
                'email' => 'user186@cap-collectif.com',
            ],
            [
                'username' => 'user187',
                'email' => 'user187@cap-collectif.com',
            ],
            [
                'username' => 'user188',
                'email' => 'user188@cap-collectif.com',
            ],
            [
                'username' => 'user189',
                'email' => 'user189@cap-collectif.com',
            ],
            [
                'username' => 'user19',
                'email' => 'user19@cap-collectif.com',
            ],
            [
                'username' => 'user190',
                'email' => 'user190@cap-collectif.com',
            ],
            [
                'username' => 'user191',
                'email' => 'user191@cap-collectif.com',
            ],
            [
                'username' => 'user192',
                'email' => 'user192@cap-collectif.com',
            ],
            [
                'username' => 'user193',
                'email' => 'user193@cap-collectif.com',
            ],
            [
                'username' => 'user194',
                'email' => 'user194@cap-collectif.com',
            ],
            [
                'username' => 'user195',
                'email' => 'user195@cap-collectif.com',
            ],
            [
                'username' => 'user196',
                'email' => 'user196@cap-collectif.com',
            ],
            [
                'username' => 'user197',
                'email' => 'user197@cap-collectif.com',
            ],
            [
                'username' => 'user198',
                'email' => 'user198@cap-collectif.com',
            ],
            [
                'username' => 'user199',
                'email' => 'user199@cap-collectif.com',
            ],
            [
                'username' => 'user20',
                'email' => 'user20@cap-collectif.com',
            ],
            [
                'username' => 'user200',
                'email' => 'user200@cap-collectif.com',
            ],
            [
                'username' => 'user21',
                'email' => 'user21@cap-collectif.com',
            ],
            [
                'username' => 'user22',
                'email' => 'user22@cap-collectif.com',
            ],
            [
                'username' => 'user23',
                'email' => 'user23@cap-collectif.com',
            ],
            [
                'username' => 'user24',
                'email' => 'user24@cap-collectif.com',
            ],
            [
                'username' => 'user25',
                'email' => 'user25@cap-collectif.com',
            ],
            [
                'username' => 'user26',
                'email' => 'user26@cap-collectif.com',
            ],
            [
                'username' => 'user27',
                'email' => 'user27@cap-collectif.com',
            ],
            [
                'username' => 'user28',
                'email' => 'user28@cap-collectif.com',
            ],
            [
                'username' => 'user29',
                'email' => 'user29@cap-collectif.com',
            ],
            [
                'username' => 'user30',
                'email' => 'user30@cap-collectif.com',
            ],
            [
                'username' => 'user31',
                'email' => 'user31@cap-collectif.com',
            ],
            [
                'username' => 'user32',
                'email' => 'user32@cap-collectif.com',
            ],
            [
                'username' => 'user33',
                'email' => 'user33@cap-collectif.com',
            ],
            [
                'username' => 'user34',
                'email' => 'user34@cap-collectif.com',
            ],
            [
                'username' => 'user35',
                'email' => 'user35@cap-collectif.com',
            ],
            [
                'username' => 'user36',
                'email' => 'user36@cap-collectif.com',
            ],
            [
                'username' => 'user37',
                'email' => 'user37@cap-collectif.com',
            ],
            [
                'username' => 'user38',
                'email' => 'user38@cap-collectif.com',
            ],
            [
                'username' => 'user39',
                'email' => 'user39@cap-collectif.com',
            ],
            [
                'username' => 'user40',
                'email' => 'user40@cap-collectif.com',
            ],
            [
                'username' => 'user41',
                'email' => 'user41@cap-collectif.com',
            ],
            [
                'username' => 'user42',
                'email' => 'user42@cap-collectif.com',
            ],
            [
                'username' => 'user43',
                'email' => 'user43@cap-collectif.com',
            ],
            [
                'username' => 'user44',
                'email' => 'user44@cap-collectif.com',
            ],
            [
                'username' => 'user45',
                'email' => 'user45@cap-collectif.com',
            ],
            [
                'username' => 'user46',
                'email' => 'user46@cap-collectif.com',
            ],
            [
                'username' => 'user47',
                'email' => 'user47@cap-collectif.com',
            ],
            [
                'username' => 'user48',
                'email' => 'user48@cap-collectif.com',
            ],
            [
                'username' => 'user49',
                'email' => 'user49@cap-collectif.com',
            ],
            [
                'username' => 'user',
                'email' => 'user@test.com',
            ],
            [
                'username' => 'user50',
                'email' => 'user50@cap-collectif.com',
            ],
            [
                'username' => 'user51',
                'email' => 'user51@cap-collectif.com',
            ],
            [
                'username' => 'user52',
                'email' => 'user52@cap-collectif.com',
            ],
            [
                'username' => 'OnePunchMan',
                'email' => 'saitama@cap-collectif.com',
            ],
            [
                'username' => 'user53',
                'email' => 'user53@cap-collectif.com',
            ],
            [
                'username' => 'user54',
                'email' => 'user54@cap-collectif.com',
            ],
            [
                'username' => 'user55',
                'email' => 'user55@cap-collectif.com',
            ],
            [
                'username' => 'user56',
                'email' => 'user56@cap-collectif.com',
            ],
            [
                'username' => 'user57',
                'email' => 'user57@cap-collectif.com',
            ],
            [
                'username' => 'user58',
                'email' => 'user58@cap-collectif.com',
            ],
            [
                'username' => 'user59',
                'email' => 'user59@cap-collectif.com',
            ],
            [
                'username' => 'user6',
                'email' => 'user6@cap-collectif.com',
            ],
            [
                'username' => 'user60',
                'email' => 'user60@cap-collectif.com',
            ],
            [
                'username' => 'user61',
                'email' => 'user61@cap-collectif.com',
            ],
            [
                'username' => 'user62',
                'email' => 'user62@cap-collectif.com',
            ],
            [
                'username' => 'user63',
                'email' => 'user63@cap-collectif.com',
            ],
            [
                'username' => 'user64',
                'email' => 'user64@cap-collectif.com',
            ],
            [
                'username' => 'user65',
                'email' => 'user65@cap-collectif.com',
            ],
            [
                'username' => 'user66',
                'email' => 'user66@cap-collectif.com',
            ],
            [
                'username' => 'user67',
                'email' => 'user67@cap-collectif.com',
            ],
            [
                'username' => 'user68',
                'email' => 'user68@cap-collectif.com',
            ],
            [
                'username' => 'user69',
                'email' => 'user69@cap-collectif.com',
            ],
            [
                'username' => 'user7',
                'email' => 'user7@cap-collectif.com',
            ],
            [
                'username' => 'user70',
                'email' => 'user70@cap-collectif.com',
            ],
            [
                'username' => 'user71',
                'email' => 'user71@cap-collectif.com',
            ],
            [
                'username' => 'user72',
                'email' => 'user72@cap-collectif.com',
            ],
            [
                'username' => 'user73',
                'email' => 'user73@cap-collectif.com',
            ],
            [
                'username' => 'user74',
                'email' => 'user74@cap-collectif.com',
            ],
            [
                'username' => 'user75',
                'email' => 'user75@cap-collectif.com',
            ],
            [
                'username' => 'user76',
                'email' => 'user76@cap-collectif.com',
            ],
            [
                'username' => 'user77',
                'email' => 'user77@cap-collectif.com',
            ],
            [
                'username' => 'user78',
                'email' => 'user78@cap-collectif.com',
            ],
            [
                'username' => 'user79',
                'email' => 'user79@cap-collectif.com',
            ],
            [
                'username' => 'user8',
                'email' => 'user8@cap-collectif.com',
            ],
            [
                'username' => 'user80',
                'email' => 'user80@cap-collectif.com',
            ],
            [
                'username' => 'user81',
                'email' => 'user81@cap-collectif.com',
            ],
            [
                'username' => 'user82',
                'email' => 'user82@cap-collectif.com',
            ],
            [
                'username' => 'user83',
                'email' => 'user83@cap-collectif.com',
            ],
            [
                'username' => 'user84',
                'email' => 'user84@cap-collectif.com',
            ],
            [
                'username' => 'user85',
                'email' => 'user85@cap-collectif.com',
            ],
            [
                'username' => 'user86',
                'email' => 'user86@cap-collectif.com',
            ],
            [
                'username' => 'user87',
                'email' => 'user87@cap-collectif.com',
            ],
            [
                'username' => 'user88',
                'email' => 'user88@cap-collectif.com',
            ],
            [
                'username' => 'user89',
                'email' => 'user89@cap-collectif.com',
            ],
            [
                'username' => 'user9',
                'email' => 'user9@cap-collectif.com',
            ],
            [
                'username' => 'user90',
                'email' => 'user90@cap-collectif.com',
            ],
            [
                'username' => 'user91',
                'email' => 'user91@cap-collectif.com',
            ],
            [
                'username' => 'user92',
                'email' => 'user92@cap-collectif.com',
            ],
            [
                'username' => 'user93',
                'email' => 'user93@cap-collectif.com',
            ],
            [
                'username' => 'user94',
                'email' => 'user94@cap-collectif.com',
            ],
            [
                'username' => 'user95',
                'email' => 'user95@cap-collectif.com',
            ],
            [
                'username' => 'user96',
                'email' => 'user96@cap-collectif.com',
            ],
            [
                'username' => 'user97',
                'email' => 'user97@cap-collectif.com',
            ],
            [
                'username' => 'user98',
                'email' => 'user98@cap-collectif.com',
            ],
            [
                'username' => 'user99',
                'email' => 'user99@cap-collectif.com',
            ],
            [
                'username' => 'Agui',
                'email' => 'julien.aguilar@cap-collectif.com',
            ],
            [
                'username' => 'Dev null',
                'email' => 'mickael@cap-collectif.com',
            ],
            [
                'username' => 'Théo QP',
                'email' => 'theo@cap-collectif.com',
            ],
            [
                'username' => 'userWithConfirmedPhone',
                'email' => 'userWithConfirmedPhone@cap-collectif.com',
            ],
            [
                'username' => 'Valérie Masson Delmotte',
                'email' => 'valerie.massondelmotte@cap-collectif.com',
            ],
            [
                'username' => 'emailingUser1',
                'email' => 'emailing.user1@fake-email.com',
            ],
            [
                'username' => 'emailingUser2',
                'email' => 'emailing.user2@fake-email.com',
            ],
            [
                'username' => 'emailingUser3',
                'email' => 'emailing.user3@fake-email.com',
            ],
            [
                'username' => 'emailingUser4',
                'email' => 'emailing.user4@fake-email.com',
            ],
            [
                'username' => 'emailingUser5',
                'email' => 'emailing.user5@fake-email.com',
            ],
            [
                'username' => 'emailingUser6',
                'email' => 'emailing.user6@fake-email.com',
            ],
            [
                'username' => 'emailingUser7',
                'email' => 'emailing.user7@fake-email.com',
            ],
            [
                'username' => 'emailingUser8',
                'email' => 'emailing.user8@fake-email.com',
            ],
            [
                'username' => 'emailingUser9',
                'email' => 'emailing.user9@fake-email.com',
            ],
            [
                'username' => 'emailingUser10',
                'email' => 'emailing.user10@fake-email.com',
            ],
            [
                'username' => 'emailingUser11',
                'email' => 'emailing.user11@fake-email.com',
            ],
            [
                'username' => 'emailingUser12',
                'email' => 'emailing.user12@fake-email.com',
            ],
            [
                'username' => 'emailingUser13',
                'email' => 'emailing.user13@fake-email.com',
            ],
            [
                'username' => 'emailingUser14',
                'email' => 'emailing.user14@fake-email.com',
            ],
            [
                'username' => 'emailingUser15',
                'email' => 'emailing.user15@fake-email.com',
            ],
            [
                'username' => 'emailingUser16',
                'email' => 'emailing.user16@fake-email.com',
            ],
            [
                'username' => 'emailingUser17',
                'email' => 'emailing.user17@fake-email.com',
            ],
            [
                'username' => 'emailingUser18',
                'email' => 'emailing.user18@fake-email.com',
            ],
            [
                'username' => 'emailingUser19',
                'email' => 'emailing.user19@fake-email.com',
            ],
            [
                'username' => 'emailingUser20',
                'email' => 'emailing.user20@fake-email.com',
            ],
            [
                'username' => 'emailingUser21',
                'email' => 'emailing.user21@fake-email.com',
            ],
            [
                'username' => 'emailingUser22',
                'email' => 'emailing.user22@fake-email.com',
            ],
        ];
    }

    /**
     * @return array<int, array{username: string, email:string}>
     */
    private function userGroupExpectedRecipients(): array
    {
        return [
            [
                'username' => 'emailingUser3',
                'email' => 'emailing.user3@fake-email.com',
            ],
            [
                'username' => 'emailingUser4',
                'email' => 'emailing.user4@fake-email.com',
            ],
        ];
    }

    /**
     * @return array<int, array{username: ?string, email:string}>
     */
    private function projectCollectVoteExpectedRecipients(): array
    {
        return [
            [
                'username' => null,
                'email' => 'emilie.compte-panille@cap-collectif.com',
            ],
            [
                'username' => null,
                'email' => 'fake.email.against@cap-collectif.com',
            ],
            [
                'username' => null,
                'email' => 'fake.email.for@cap-collectif.com',
            ],
            [
                'username' => 'emailingadmin',
                'email' => 'emailing.admin@fake-email.com',
            ],
            [
                'username' => 'emailingUser10',
                'email' => 'emailing.user10@fake-email.com',
            ],
            [
                'username' => 'emailingUser17',
                'email' => 'emailing.user17@fake-email.com',
            ],
            [
                'username' => 'emailingUser18',
                'email' => 'emailing.user18@fake-email.com',
            ],
            [
                'username' => 'emailingUser19',
                'email' => 'emailing.user19@fake-email.com',
            ],
            [
                'username' => 'emailingUser20',
                'email' => 'emailing.user20@fake-email.com',
            ],
            [
                'username' => 'emailingUser21',
                'email' => 'emailing.user21@fake-email.com',
            ],
            [
                'username' => 'emailingUser22',
                'email' => 'emailing.user22@fake-email.com',
            ],
            [
                'username' => 'emailingUser6',
                'email' => 'emailing.user6@fake-email.com',
            ],
            [
                'username' => 'emailingUser7',
                'email' => 'emailing.user7@fake-email.com',
            ],
            [
                'username' => 'emailingUser8',
                'email' => 'emailing.user8@fake-email.com',
            ],
        ];
    }

    /**
     * @return array<int, array{username: string, email:string}>
     */
    private function projectSelectionVoteExpectedRecipients(): array
    {
        return [
            [
                'username' => 'emailingadmin',
                'email' => 'emailing.admin@fake-email.com',
            ],
            [
                'username' => 'emailingUser13',
                'email' => 'emailing.user13@fake-email.com',
            ],
            [
                'username' => 'emailingUser15',
                'email' => 'emailing.user15@fake-email.com',
            ],
        ];
    }

    /**
     * @return array<int, array{username: string, email:string}>
     */
    private function projectConsultationExpectedRecipients(): array
    {
        return [
            [
                'username' => 'emailingadmin',
                'email' => 'emailing.admin@fake-email.com',
            ],
            [
                'username' => 'emailingUser11',
                'email' => 'emailing.user11@fake-email.com',
            ],
            [
                'username' => 'emailingUser12',
                'email' => 'emailing.user12@fake-email.com',
            ],
            [
                'username' => 'emailingUser13',
                'email' => 'emailing.user13@fake-email.com',
            ],
            [
                'username' => 'emailingUser14',
                'email' => 'emailing.user14@fake-email.com',
            ],
            [
                'username' => 'emailingUser15',
                'email' => 'emailing.user15@fake-email.com',
            ],
            [
                'username' => 'emailingUser16',
                'email' => 'emailing.user16@fake-email.com',
            ],
        ];
    }
}
